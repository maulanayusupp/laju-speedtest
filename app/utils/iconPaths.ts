// =============================================================================
// Icon registry: 24×24 stroke paths rendered by <BaseIcon name="…" />.
// One source of truth means no stray inline <svg> markup in components.
// Every entry is drawn with fill: none, so paths describe outlines only.
// =============================================================================

export const iconPaths = {
  download: 'M12 3v11m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  upload: 'M12 21V10m0 0-4 4m4-4 4 4M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  activity: 'M3 12h4l3 8 4-16 3 8h4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z',
  wifi: 'M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.4a5 5 0 0 1 7 0M12 19h.01',
  shield: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3Z',
  lock: 'M5 11h14v10H5zM9 11V8a3 3 0 0 1 6 0v3',
  eye: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6ZM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  phone: 'M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a1 1 0 0 1-1 1A17 17 0 0 1 3 5a1 1 0 0 1 1-1Z',
  message: 'M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z',
  copy: 'M9 9h10v10H9zM15 9V5H5v10h4',
  check: 'M4 12l5 5L20 6',
  play: 'M8 5l11 7-11 7V5Z',
  refresh: 'M20.5 12a8.5 8.5 0 1 1-2.5-6M20.5 3.5v5h-5',
  chevron: 'M6 9l6 6 6-6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  server: 'M4 5h16v5H4zM4 14h16v5H4zM8 7.5h.01M8 16.5h.01',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  alert: 'M12 3l9 16H3L12 3ZM12 10v4M12 17h.01',
  video: 'M3 7h11v10H3zM14 11l7-4v10l-7-4',
  monitor: 'M3 5h18v11H3zM9 20h6M12 16v4',
  gamepad: 'M7 12h4M9 10v4M15.5 11.5h.01M18 13.5h.01M6 8h12a4 4 0 0 1 0 8H6a4 4 0 0 1 0-8Z',
  cloud: 'M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.6 1.3A3.5 3.5 0 0 1 17.5 18Z',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 19v-1a4 4 0 0 0-3-3.9M16.5 4.1a4 4 0 0 1 0 6.8',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
  code: 'M9 8l-5 4 5 4M15 8l5 4-5 4',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13',
  share: 'M12 3v13M12 3 8 7m4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5',
} as const

export type IconName = keyof typeof iconPaths
