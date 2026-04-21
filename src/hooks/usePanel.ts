import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArticleMarker, PanelConfig, PanelState, PanelStatus } from '../types';
import { fetchRandomSummary } from '../lib/wikipedia';
import { getEncoder, type Encoder } from '../lib/tokenizer';
import { useTokenStream } from './useTokenStream';

const SAMPLE_WINDOW = 30;
const PREFETCH_THRESHOLD = 0.2;

type Init = { id: string; config: PanelConfig };

export function usePanel({ id, config: initialConfig }: Init) {
  const [config, setConfig] = useState<PanelConfig>(initialConfig);
  const [status, setStatus] = useState<PanelStatus>('idle');
  const [tokens, setTokens] = useState<string[]>([]);
  const [articles, setArticles] = useState<ArticleMarker[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tokPerSecSamples, setSamples] = useState<number[]>([]);
  const [error, setError] = useState<string | undefined>();

  const pendingIdsRef = useRef<number[]>([]);
  const encoderRef = useRef<Encoder | null>(null);
  const nextArticlePromiseRef = useRef<Promise<void> | null>(null);
  const lastSampleAtRef = useRef(0);
  const sampleAccumRef = useRef(0);
  const tokensLenRef = useRef(0);

  useEffect(() => {
    tokensLenRef.current = tokens.length;
  }, [tokens.length]);

  const prefetchNext = useCallback(async () => {
    nextArticlePromiseRef.current = (async () => {
      try {
        const { title, extract } = await fetchRandomSummary(config.lang);
        const enc = encoderRef.current ?? (await getEncoder());
        encoderRef.current = enc;
        const ids = enc.encode(extract);
        setArticles((prev) => [
          ...prev,
          { title, startTokenIndex: tokensLenRef.current + pendingIdsRef.current.length },
        ]);
        pendingIdsRef.current.push(...ids);
      } catch {
      } finally {
        nextArticlePromiseRef.current = null;
      }
    })();
  }, [config.lang]);

  const stream = useTokenStream({
    speed: config.speed,
    onAdvance: (add, elapsed) => {
      setElapsedMs(elapsed);
      emitTokens(add, elapsed);
    },
  });

  const emitTokens = useCallback(
    (add: number, elapsed: number) => {
      const enc = encoderRef.current;
      if (!enc) return;

      const take = Math.min(add, pendingIdsRef.current.length);
      if (take <= 0) return;

      const ids = pendingIdsRef.current.splice(0, take);
      const pieces = ids.map((id) => enc.decodeOne(id));

      setTokens((prev) => {
        const next = prev.concat(pieces);
        if (next.length >= config.maxTokens) {
          stream.stop();
          setStatus('done');
        }
        return next;
      });

      sampleAccumRef.current += take;
      if (elapsed - lastSampleAtRef.current >= 1000) {
        lastSampleAtRef.current = elapsed;
        const rate = sampleAccumRef.current;
        sampleAccumRef.current = 0;
        setSamples((prev) => {
          const next = prev.concat([rate]);
          return next.length > SAMPLE_WINDOW ? next.slice(-SAMPLE_WINDOW) : next;
        });
      }

      const remaining = pendingIdsRef.current.length;
      const budgetLeft = config.maxTokens - tokensLenRef.current;
      if (
        budgetLeft > 0 &&
        remaining < budgetLeft * PREFETCH_THRESHOLD &&
        nextArticlePromiseRef.current === null
      ) {
        void prefetchNext();
      }
    },
    [config.maxTokens, prefetchNext, stream],
  );

  const start = useCallback(async () => {
    setError(undefined);
    setStatus('fetching');
    try {
      const enc = await getEncoder();
      encoderRef.current = enc;
      const { title, extract } = await fetchRandomSummary(config.lang);
      const ids = enc.encode(extract);
      pendingIdsRef.current = ids;
      setArticles([{ title, startTokenIndex: 0 }]);
      setTokens([]);
      setElapsedMs(0);
      setSamples([]);
      lastSampleAtRef.current = 0;
      sampleAccumRef.current = 0;
      setStatus('running');
      stream.start();
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, [config.lang, stream]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    stream.pause();
    setStatus('paused');
  }, [status, stream]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    stream.resume();
    setStatus('running');
  }, [status, stream]);

  const restart = useCallback(() => {
    stream.stop();
    pendingIdsRef.current = [];
    setTokens([]);
    setArticles([]);
    setElapsedMs(0);
    setSamples([]);
    setStatus('idle');
    setError(undefined);
    void start();
  }, [stream, start]);

  const newText = useCallback(() => {
    restart();
  }, [restart]);

  const updateConfig = useCallback((patch: Partial<PanelConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const state: PanelState = {
    id,
    config,
    status,
    tokens,
    tokenCount: tokens.length,
    elapsedMs,
    articles,
    tokPerSecSamples,
    error,
  };

  useEffect(() => () => stream.stop(), [stream]);

  return {
    state,
    actions: { start, pause, resume, restart, newText, updateConfig },
  };
}
