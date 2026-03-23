/**
 * App-wide navigation hook that works across all nested navigators.
 * Uses `any` type to avoid complex composite navigation type boilerplate
 * while allowing screens in nested stacks to navigate freely.
 */
import { useNavigation } from '@react-navigation/native'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAppNavigation(): any {
  return useNavigation()
}
