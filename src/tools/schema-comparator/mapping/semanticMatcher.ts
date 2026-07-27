/**
 * WYN Intelligent Mapping Engine - Semantic Matcher
 * Calculates string, token, and structural similarities between database entities.
 */

export class SemanticMatcher {
  /**
   * Calculates Levenshtein distance between two strings.
   */
  public levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Calculates similarity score (0 to 100) based on Levenshtein distance.
   */
  public stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);

    return Math.round(((maxLength - distance) / maxLength) * 100);
  }

  /**
   * Tokenizes a string by snake_case, camelCase, dash, space.
   */
  public tokenize(str: string): string[] {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
  }

  /**
   * Calculates Jaccard similarity (0 to 100) between two arrays of tokens/items.
   */
  public jaccardSimilarity(setA: string[], setB: string[]): number {
    if (setA.length === 0 && setB.length === 0) return 100;
    if (setA.length === 0 || setB.length === 0) return 0;

    const lowerA = new Set(setA.map((s) => s.toLowerCase()));
    const lowerB = new Set(setB.map((s) => s.toLowerCase()));

    let intersectionCount = 0;
    lowerA.forEach((item) => {
      if (lowerB.has(item)) intersectionCount++;
    });

    const unionCount = new Set([...lowerA, ...lowerB]).size;
    if (unionCount === 0) return 0;

    return Math.round((intersectionCount / unionCount) * 100);
  }

  /**
   * Calculates combined name & token similarity score.
   */
  public calculateNameSimilarity(nameA: string, nameB: string): number {
    const levSim = this.stringSimilarity(nameA, nameB);
    const tokensA = this.tokenize(nameA);
    const tokensB = this.tokenize(nameB);
    const tokenSim = this.jaccardSimilarity(tokensA, tokensB);

    return Math.round(levSim * 0.4 + tokenSim * 0.6);
  }
}
