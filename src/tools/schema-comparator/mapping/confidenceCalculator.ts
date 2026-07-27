/**
 * WYN Intelligent Mapping Engine - Confidence Calculator
 * Maps confidence scores (0–100) to standard levels and aggregates metrics.
 */

import { ConfidenceLevel } from '../types';

export class ConfidenceCalculator {
  public static getLevel(score: number): ConfidenceLevel {
    if (score >= 95) return 'VERY_HIGH';
    if (score >= 80) return 'HIGH';
    if (score >= 60) return 'MEDIUM';
    return 'LOW';
  }

  public static summarizeConfidence(scores: number[]): {
    veryHighCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  } {
    let veryHighCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const score of scores) {
      const level = this.getLevel(score);
      if (level === 'VERY_HIGH') veryHighCount++;
      else if (level === 'HIGH') highCount++;
      else if (level === 'MEDIUM') mediumCount++;
      else lowCount++;
    }

    return {
      veryHighCount,
      highCount,
      mediumCount,
      lowCount,
    };
  }
}
