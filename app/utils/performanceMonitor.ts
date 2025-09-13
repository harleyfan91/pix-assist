/**
 * Performance monitoring utilities for optimization validation
 * 
 * Provides tools to measure and track performance improvements
 * across different components and operations.
 */

interface PerformanceMetrics {
  componentName: string
  operation: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private isEnabled: boolean = __DEV__ // Only enable in development

  /**
   * Start timing a performance operation
   */
  startTiming(id: string, componentName: string, operation: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return

    this.metrics.set(id, {
      componentName,
      operation,
      startTime: performance.now(),
      metadata
    })
  }

  /**
   * End timing a performance operation
   */
  endTiming(id: string): number | null {
    if (!this.isEnabled) return null

    const metric = this.metrics.get(id)
    if (!metric) return null

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    // Log performance metrics in development
    console.log(`[PERF] ${metric.componentName} - ${metric.operation}: ${duration.toFixed(2)}ms`, metric.metadata)

    return duration
  }

  /**
   * Get performance metrics for a component
   */
  getMetrics(componentName?: string): PerformanceMetrics[] {
    const allMetrics = Array.from(this.metrics.values())
    
    if (componentName) {
      return allMetrics.filter(metric => metric.componentName === componentName)
    }
    
    return allMetrics
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  /**
   * Get average performance for an operation
   */
  getAveragePerformance(componentName: string, operation: string): number {
    const metrics = this.getMetrics(componentName)
      .filter(metric => metric.operation === operation && metric.duration !== undefined)
    
    if (metrics.length === 0) return 0
    
    const totalDuration = metrics.reduce((sum, metric) => sum + (metric.duration || 0), 0)
    return totalDuration / metrics.length
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience functions
export const startTiming = (id: string, componentName: string, operation: string, metadata?: Record<string, any>) => {
  performanceMonitor.startTiming(id, componentName, operation, metadata)
}

export const endTiming = (id: string) => {
  return performanceMonitor.endTiming(id)
}

export const measureAsync = async <T>(
  id: string,
  componentName: string,
  operation: string,
  asyncFn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  startTiming(id, componentName, operation, metadata)
  try {
    const result = await asyncFn()
    endTiming(id)
    return result
  } catch (error) {
    endTiming(id)
    throw error
  }
}

export const measureSync = <T>(
  id: string,
  componentName: string,
  operation: string,
  syncFn: () => T,
  metadata?: Record<string, any>
): T => {
  startTiming(id, componentName, operation, metadata)
  try {
    const result = syncFn()
    endTiming(id)
    return result
  } catch (error) {
    endTiming(id)
    throw error
  }
}
