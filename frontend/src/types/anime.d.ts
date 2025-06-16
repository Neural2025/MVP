declare module 'animejs' {
  interface AnimeParams {
    targets?: any;
    translateY?: number[];
    translateX?: number[];
    opacity?: number[];
    scale?: number[];
    duration?: number | (() => number);
    delay?: number | (() => number);
    easing?: string;
    direction?: string;
    loop?: boolean;
    round?: number;
    innerHTML?: any[];
    [key: string]: any;
  }

  interface AnimeTimeline {
    add(params: AnimeParams, offset?: string): AnimeTimeline;
  }

  interface AnimeStatic {
    (params: AnimeParams): any;
    timeline(params?: { easing?: string }): AnimeTimeline;
    stagger(value: number, options?: { start?: number }): any;
    random(min: number, max: number): number;
  }

  const anime: AnimeStatic;
  export = anime;
}
