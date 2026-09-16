import { h } from 'vue'

// Crear iconos como componentes reutilizables
const createIcon = (paths) => ({
  render: () => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2'
  }, paths.map((p) => h(...p)))
})

const createIconSolid = (d) => ({
  render: () => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [h('path', { d })])
})

export const useIcons = () => ({
  // Navigation Icons
  IconDashboard: createIcon([
    ['rect', { x: '3', y: '3', width: '7', height: '7' }],
    ['rect', { x: '14', y: '3', width: '7', height: '7' }],
    ['rect', { x: '14', y: '14', width: '7', height: '7' }],
    ['rect', { x: '3', y: '14', width: '7', height: '7' }]
  ]),

  IconAtractivos: createIcon([
    ['path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
    ['polyline', { points: '9 22 9 12 15 12 15 22' }]
  ]),

  IconExperiencias: createIcon([
    ['polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }]
  ]),

  IconRutas: createIcon([
    ['path', { d: 'M3 12h18' }],
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M3 18h18' }]
  ]),

  IconCatalogos: createIcon([
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['circle', { cx: '18', cy: '6', r: '3' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    ['circle', { cx: '18', cy: '18', r: '3' }]
  ]),

  IconUsuarios: createIcon([
    ['path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
    ['path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }],
    ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }]
  ]),

  IconRoles: createIcon([
    ['polygon', { points: '12 2 20 6 20 14 12 18 4 14 4 6 12 2' }],
    ['line', { x1: '12', y1: '9', x2: '12', y2: '17' }],
    ['polyline', { points: '9 11 12 13 15 11' }]
  ]),

  IconAuditoria: createIcon([
    ['path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' }]
  ]),

  IconReportes: createIcon([
    ['path', { d: 'M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7h18M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' }],
    ['rect', { x: '6', y: '10', width: '3', height: '4' }],
    ['rect', { x: '12', y: '10', width: '3', height: '6' }],
    ['rect', { x: '18', y: '10', width: '3', height: '5' }]
  ]),

  // Action Icons
  IconPlus: createIcon([
    ['line', { x1: '12', y1: '5', x2: '12', y2: '19' }],
    ['line', { x1: '5', y1: '12', x2: '19', y2: '12' }]
  ]),

  IconEdit: createIcon([
    ['path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
    ['path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }]
  ]),

  IconTrash: createIcon([
    ['polyline', { points: '3 6 5 6 21 6' }],
    ['path', { d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' }],
    ['path', { d: 'M10 11v6M14 11v6' }],
    ['path', { d: 'M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' }]
  ]),

  IconView: createIcon([
    ['path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }],
    ['circle', { cx: '12', cy: '12', r: '3' }]
  ]),

  IconSearch: createIcon([
    ['circle', { cx: '11', cy: '11', r: '8' }],
    ['line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }]
  ]),

  IconX: createIcon([
    ['line', { x1: '18', y1: '6', x2: '6', y2: '18' }],
    ['line', { x1: '6', y1: '6', x2: '18', y2: '18' }]
  ]),

  IconCheck: createIcon([
    ['polyline', { points: '20 6 9 17 4 12' }]
  ]),

  IconArrowRight: createIcon([
    ['line', { x1: '5', y1: '12', x2: '19', y2: '12' }],
    ['polyline', { points: '12 5 19 12 12 19' }]
  ]),

  // Status Icons
  IconSuccess: createIconSolid('M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'),
  IconWarning: createIconSolid('M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'),
  IconError: createIconSolid('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'),
  IconInfo: createIcon([
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '12', y1: '16', x2: '12', y2: '12' }],
    ['line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }]
  ]),

  // State Icons
  IconLoader: createIcon([
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 6v6l4 2' }]
  ]),

  IconMenu: createIcon([
    ['line', { x1: '3', y1: '12', x2: '21', y2: '12' }],
    ['line', { x1: '3', y1: '6', x2: '21', y2: '6' }],
    ['line', { x1: '3', y1: '18', x2: '21', y2: '18' }]
  ]),

  IconLogout: createIcon([
    ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }],
    ['polyline', { points: '16 17 21 12 16 7' }],
    ['line', { x1: '21', y1: '12', x2: '9', y2: '12' }]
  ])
})
