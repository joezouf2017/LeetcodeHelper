// lib/lists/blind75.ts
// Blind 75 — the original 75-problem list by Yangshun Tay (2018).
// Category grouping here is Blind 75's own (Arrays, Strings, Matrix, ...),
// which differs from NeetCode 150's grouping — that's expected, each list
// keeps its own topic taxonomy. Progress is keyed by `id` (the LeetCode slug),
// so a problem shared with another list (e.g. Two Sum) shares its progress.

import type { Difficulty } from "./types";

export interface ListProblem {
  id: string;         // == slug, stable across all lists
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;   // this list's own topic name
  order: number;       // position within the list, for default sort
  premium?: boolean;
  freeUrl?: string;
}

export const BLIND75: ListProblem[] = [
  // Arrays (15)
  { id: "two-sum", title: "Two Sum", slug: "two-sum", difficulty: "Easy", category: "Arrays", order: 1 },
  { id: "contains-duplicate", title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", category: "Arrays", order: 2 },
  { id: "top-k-frequent-elements", title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", category: "Arrays", order: 3 },
  { id: "product-of-array-except-self", title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: "Medium", category: "Arrays", order: 4 },
  { id: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", difficulty: "Medium", category: "Arrays", order: 5 },
  { id: "3sum", title: "3Sum", slug: "3sum", difficulty: "Medium", category: "Arrays", order: 6 },
  { id: "container-with-most-water", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", category: "Arrays", order: 7 },
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", category: "Arrays", order: 8 },
  { id: "combination-sum", title: "Combination Sum", slug: "combination-sum", difficulty: "Medium", category: "Arrays", order: 9 },
  { id: "insert-interval", title: "Insert Interval", slug: "insert-interval", difficulty: "Medium", category: "Arrays", order: 10 },
  { id: "merge-intervals", title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", category: "Arrays", order: 11 },
  { id: "non-overlapping-intervals", title: "Non-overlapping Intervals", slug: "non-overlapping-intervals", difficulty: "Medium", category: "Arrays", order: 12 },
  { id: "meeting-rooms", title: "Meeting Rooms", slug: "meeting-rooms", difficulty: "Easy", category: "Arrays", order: 13, premium: true, freeUrl: "https://www.lintcode.com/problem/920/" },
  { id: "meeting-rooms-ii", title: "Meeting Rooms II", slug: "meeting-rooms-ii", difficulty: "Medium", category: "Arrays", order: 14, premium: true, freeUrl: "https://www.lintcode.com/problem/919/" },
  { id: "missing-number", title: "Missing Number", slug: "missing-number", difficulty: "Easy", category: "Arrays", order: 15 },

  // Strings (9)
  { id: "valid-anagram", title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", category: "Strings", order: 16 },
  { id: "group-anagrams", title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", category: "Strings", order: 17 },
  { id: "encode-and-decode-strings", title: "Encode and Decode Strings", slug: "encode-and-decode-strings", difficulty: "Medium", category: "Strings", order: 18, premium: true, freeUrl: "https://www.lintcode.com/problem/659/" },
  { id: "valid-palindrome", title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", category: "Strings", order: 19 },
  { id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", category: "Strings", order: 20 },
  { id: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", difficulty: "Medium", category: "Strings", order: 21 },
  { id: "minimum-window-substring", title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", category: "Strings", order: 22 },
  { id: "longest-palindromic-substring", title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", difficulty: "Medium", category: "Strings", order: 23 },
  { id: "palindromic-substrings", title: "Palindromic Substrings", slug: "palindromic-substrings", difficulty: "Medium", category: "Strings", order: 24 },

  // Stack (1)
  { id: "valid-parentheses", title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", category: "Stack", order: 25 },

  // Matrix (3)
  { id: "rotate-image", title: "Rotate Image", slug: "rotate-image", difficulty: "Medium", category: "Matrix", order: 26 },
  { id: "spiral-matrix", title: "Spiral Matrix", slug: "spiral-matrix", difficulty: "Medium", category: "Matrix", order: 27 },
  { id: "set-matrix-zeroes", title: "Set Matrix Zeroes", slug: "set-matrix-zeroes", difficulty: "Medium", category: "Matrix", order: 28 },

  // Binary Search (2)
  { id: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", difficulty: "Medium", category: "Binary Search", order: 29 },
  { id: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", category: "Binary Search", order: 30 },

  // Linked List (6)
  { id: "reverse-linked-list", title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", category: "Linked List", order: 31 },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", category: "Linked List", order: 32 },
  { id: "linked-list-cycle", title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "Easy", category: "Linked List", order: 33 },
  { id: "reorder-list", title: "Reorder List", slug: "reorder-list", difficulty: "Medium", category: "Linked List", order: 34 },
  { id: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: "Medium", category: "Linked List", order: 35 },
  { id: "merge-k-sorted-lists", title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard", category: "Linked List", order: 36 },

  // Binary Tree (8)
  { id: "invert-binary-tree", title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", category: "Binary Tree", order: 37 },
  { id: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", category: "Binary Tree", order: 38 },
  { id: "same-tree", title: "Same Tree", slug: "same-tree", difficulty: "Easy", category: "Binary Tree", order: 39 },
  { id: "subtree-of-another-tree", title: "Subtree of Another Tree", slug: "subtree-of-another-tree", difficulty: "Easy", category: "Binary Tree", order: 40 },
  { id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", category: "Binary Tree", order: 41 },
  { id: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", difficulty: "Medium", category: "Binary Tree", order: 42 },
  { id: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", difficulty: "Hard", category: "Binary Tree", order: 43 },
  { id: "serialize-and-deserialize-binary-tree", title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", difficulty: "Hard", category: "Binary Tree", order: 44 },

  // Binary Search Tree (3)
  // LeetCode reclassified 235 from Easy to Medium; the older Blind 75 tables
  // still say Easy. Difficulty is canonical per problem (see problem-lists.ts),
  // so it must match neetcode150.ts — tests/lists.test.ts enforces that.
  { id: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium", category: "Binary Search Tree", order: 45 },
  { id: "validate-binary-search-tree", title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "Medium", category: "Binary Search Tree", order: 46 },
  { id: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", difficulty: "Medium", category: "Binary Search Tree", order: 47 },

  // Tries (3)
  { id: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree", difficulty: "Medium", category: "Tries", order: 48 },
  { id: "design-add-and-search-words-data-structure", title: "Design Add and Search Words Data Structure", slug: "design-add-and-search-words-data-structure", difficulty: "Medium", category: "Tries", order: 49 },
  { id: "word-search-ii", title: "Word Search II", slug: "word-search-ii", difficulty: "Hard", category: "Tries", order: 50 },

  // Heap (1)
  { id: "find-median-from-data-stream", title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "Hard", category: "Heap", order: 51 },

  // Graphs (8)
  { id: "word-search", title: "Word Search", slug: "word-search", difficulty: "Medium", category: "Graphs", order: 52 },
  { id: "number-of-islands", title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", category: "Graphs", order: 53 },
  { id: "clone-graph", title: "Clone Graph", slug: "clone-graph", difficulty: "Medium", category: "Graphs", order: 54 },
  { id: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", difficulty: "Medium", category: "Graphs", order: 55 },
  { id: "course-schedule", title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", category: "Graphs", order: 56 },
  { id: "number-of-connected-components-in-an-undirected-graph", title: "Number of Connected Components in an Undirected Graph", slug: "number-of-connected-components-in-an-undirected-graph", difficulty: "Medium", category: "Graphs", order: 57, premium: true, freeUrl: "https://www.lintcode.com/problem/3651/" },
  { id: "graph-valid-tree", title: "Graph Valid Tree", slug: "graph-valid-tree", difficulty: "Medium", category: "Graphs", order: 58, premium: true, freeUrl: "https://www.lintcode.com/problem/178/" },
  { id: "alien-dictionary", title: "Alien Dictionary", slug: "alien-dictionary", difficulty: "Hard", category: "Graphs", order: 59, premium: true, freeUrl: "https://www.lintcode.com/problem/892/" },

  // Dynamic Programming (12)
  { id: "climbing-stairs", title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", category: "Dynamic Programming", order: 60 },
  { id: "house-robber", title: "House Robber", slug: "house-robber", difficulty: "Medium", category: "Dynamic Programming", order: 61 },
  { id: "house-robber-ii", title: "House Robber II", slug: "house-robber-ii", difficulty: "Medium", category: "Dynamic Programming", order: 62 },
  { id: "decode-ways", title: "Decode Ways", slug: "decode-ways", difficulty: "Medium", category: "Dynamic Programming", order: 63 },
  { id: "coin-change", title: "Coin Change", slug: "coin-change", difficulty: "Medium", category: "Dynamic Programming", order: 64 },
  { id: "maximum-product-subarray", title: "Maximum Product Subarray", slug: "maximum-product-subarray", difficulty: "Medium", category: "Dynamic Programming", order: 65 },
  { id: "word-break", title: "Word Break", slug: "word-break", difficulty: "Medium", category: "Dynamic Programming", order: 66 },
  { id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: "Medium", category: "Dynamic Programming", order: 67 },
  { id: "unique-paths", title: "Unique Paths", slug: "unique-paths", difficulty: "Medium", category: "Dynamic Programming", order: 68 },
  { id: "jump-game", title: "Jump Game", slug: "jump-game", difficulty: "Medium", category: "Dynamic Programming", order: 69 },
  { id: "combination-sum-iv", title: "Combination Sum IV", slug: "combination-sum-iv", difficulty: "Medium", category: "Dynamic Programming", order: 70 },
  { id: "maximum-subarray", title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", category: "Dynamic Programming", order: 71 },

  // Bit Manipulation (4)
  { id: "number-of-1-bits", title: "Number of 1 Bits", slug: "number-of-1-bits", difficulty: "Easy", category: "Bit Manipulation", order: 72 },
  { id: "counting-bits", title: "Counting Bits", slug: "counting-bits", difficulty: "Easy", category: "Bit Manipulation", order: 73 },
  { id: "reverse-bits", title: "Reverse Bits", slug: "reverse-bits", difficulty: "Easy", category: "Bit Manipulation", order: 74 },
  { id: "sum-of-two-integers", title: "Sum of Two Integers", slug: "sum-of-two-integers", difficulty: "Medium", category: "Bit Manipulation", order: 75 },
];
