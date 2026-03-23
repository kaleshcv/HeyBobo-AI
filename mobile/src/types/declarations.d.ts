// Type declarations for modules not yet installed or with missing types
declare module 'expo-device' {
  export const isDevice: boolean
  export function getDeviceTypeAsync(): Promise<number>
  export const brand: string | null
  export const manufacturer: string | null
  export const modelName: string | null
  export const osName: string | null
  export const osVersion: string | null
}

declare module 'react-native-svg-charts' {
  import React from 'react'
  export class LineChart extends React.Component<any> {}
  export class BarChart extends React.Component<any> {}
  export class PieChart extends React.Component<any> {}
  export class AreaChart extends React.Component<any> {}
  export class ProgressCircle extends React.Component<any> {}
  export const Grid: React.ComponentType<any>
  export const XAxis: React.ComponentType<any>
  export const YAxis: React.ComponentType<any>
}

declare module 'd3-scale' {
  export function scaleLinear(): any
  export function scaleTime(): any
  export function scaleBand(): any
  export function scaleOrdinal(): any
  export function scalePoint(): any
  const d3Scale: any
  export default d3Scale
}
