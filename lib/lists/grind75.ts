// lib/lists/grind75.ts
// Grind 75 — Yangshun Tay's successor to Blind 75, reordered by difficulty
// progression. This is the "default 75" slice of the wider Grind 169; the
// order field below preserves that intended study sequence.

import type { ListProblem } from "./blind75";

export const GRIND75: ListProblem[] = [
  // Arrays (11)
  { id: "two-sum", title: "Two Sum", slug: "two-sum", difficulty: "Easy", category: "Arrays", order: 1 },
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", category: "Arrays", order: 2 },
  { id: "majority-element", title: "Majority Element", slug: "majority-element", difficulty: "Easy", category: "Arrays", order: 3 },
  { id: "contains-duplicate", title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", category: "Arrays", order: 4 },
  { id: "insert-interval", title: "Insert Interval", slug: "insert-interval", difficulty: "Medium", category: "Arrays", order: 5 },
  { id: "3sum", title: "3Sum", slug: "3sum", difficulty: "Medium", category: "Arrays", order: 6 },
  { id: "product-of-array-except-self", title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: "Medium", category: "Arrays", order: 7 },
  { id: "combination-sum", title: "Combination Sum", slug: "combination-sum", difficulty: "Medium", category: "Arrays", order: 8 },
  { id: "merge-intervals", title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", category: "Arrays", order: 9 },
  { id: "sort-colors", title: "Sort Colors", slug: "sort-colors", difficulty: "Medium", category: "Arrays", order: 10 },
  { id: "container-with-most-water", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", category: "Arrays", order: 11 },

  // Hash Table (1)
  { id: "ransom-note", title: "Ransom Note", slug: "ransom-note", difficulty: "Easy", category: "Hash Table", order: 12 },

  // Strings (8)
  { id: "valid-palindrome", title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", category: "Strings", order: 13 },
  { id: "valid-anagram", title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", category: "Strings", order: 14 },
  { id: "longest-palindrome", title: "Longest Palindrome", slug: "longest-palindrome", difficulty: "Easy", category: "Strings", order: 15 },
  { id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", category: "Strings", order: 16 },
  { id: "string-to-integer-atoi", title: "String to Integer (atoi)", slug: "string-to-integer-atoi", difficulty: "Medium", category: "Strings", order: 17 },
  { id: "longest-palindromic-substring", title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", difficulty: "Medium", category: "Strings", order: 18 },
  { id: "find-all-anagrams-in-a-string", title: "Find All Anagrams in a String", slug: "find-all-anagrams-in-a-string", difficulty: "Medium", category: "Strings", order: 19 },
  { id: "minimum-window-substring", title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", category: "Strings", order: 20 },

  // Matrix (1)
  { id: "spiral-matrix", title: "Spiral Matrix", slug: "spiral-matrix", difficulty: "Medium", category: "Matrix", order: 21 },

  // Stack (7)
  { id: "valid-parentheses", title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", category: "Stack", order: 22 },
  { id: "implement-queue-using-stacks", title: "Implement Queue using Stacks", slug: "implement-queue-using-stacks", difficulty: "Easy", category: "Stack", order: 23 },
  { id: "min-stack", title: "Min Stack", slug: "min-stack", difficulty: "Medium", category: "Stack", order: 24 },
  { id: "evaluate-reverse-polish-notation", title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", difficulty: "Medium", category: "Stack", order: 25 },
  { id: "trapping-rain-water", title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", category: "Stack", order: 26 },
  { id: "basic-calculator", title: "Basic Calculator", slug: "basic-calculator", difficulty: "Hard", category: "Stack", order: 27 },
  { id: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "Hard", category: "Stack", order: 28 },

  // Linked List (5)
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", category: "Linked List", order: 29 },
  { id: "linked-list-cycle", title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "Easy", category: "Linked List", order: 30 },
  { id: "reverse-linked-list", title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", category: "Linked List", order: 31 },
  { id: "middle-of-the-linked-list", title: "Middle of the Linked List", slug: "middle-of-the-linked-list", difficulty: "Easy", category: "Linked List", order: 32 },
  { id: "lru-cache", title: "LRU Cache", slug: "lru-cache", difficulty: "Medium", category: "Linked List", order: 33 },

  // Binary Search (4)
  { id: "binary-search", title: "Binary Search", slug: "binary-search", difficulty: "Easy", category: "Binary Search", order: 34 },
  { id: "first-bad-version", title: "First Bad Version", slug: "first-bad-version", difficulty: "Easy", category: "Binary Search", order: 35 },
  { id: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", category: "Binary Search", order: 36 },
  { id: "time-based-key-value-store", title: "Time Based Key-Value Store", slug: "time-based-key-value-store", difficulty: "Medium", category: "Binary Search", order: 37 },

  // Recursion (3)
  { id: "permutations", title: "Permutations", slug: "permutations", difficulty: "Medium", category: "Recursion", order: 38 },
  { id: "subsets", title: "Subsets", slug: "subsets", difficulty: "Medium", category: "Recursion", order: 39 },
  { id: "letter-combinations-of-a-phone-number", title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", difficulty: "Medium", category: "Recursion", order: 40 },

  // Binary Tree (9)
  { id: "invert-binary-tree", title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", category: "Binary Tree", order: 41 },
  { id: "balanced-binary-tree", title: "Balanced Binary Tree", slug: "balanced-binary-tree", difficulty: "Easy", category: "Binary Tree", order: 42 },
  { id: "diameter-of-binary-tree", title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree", difficulty: "Easy", category: "Binary Tree", order: 43 },
  { id: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", category: "Binary Tree", order: 44 },
  { id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", category: "Binary Tree", order: 45 },
  { id: "lowest-common-ancestor-of-a-binary-tree", title: "Lowest Common Ancestor of a Binary Tree", slug: "lowest-common-ancestor-of-a-binary-tree", difficulty: "Medium", category: "Binary Tree", order: 46 },
  { id: "binary-tree-right-side-view", title: "Binary Tree Right Side View", slug: "binary-tree-right-side-view", difficulty: "Medium", category: "Binary Tree", order: 47 },
  { id: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", difficulty: "Medium", category: "Binary Tree", order: 48 },
  { id: "serialize-and-deserialize-binary-tree", title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", difficulty: "Hard", category: "Binary Tree", order: 49 },

  // Binary Search Tree (3)
  // See the same note in blind75.ts — LeetCode 235 is Medium now, not Easy.
  { id: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium", category: "Binary Search Tree", order: 50 },
  { id: "validate-binary-search-tree", title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "Medium", category: "Binary Search Tree", order: 51 },
  { id: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", difficulty: "Medium", category: "Binary Search Tree", order: 52 },

  // Heap (4)
  { id: "k-closest-points-to-origin", title: "K Closest Points to Origin", slug: "k-closest-points-to-origin", difficulty: "Medium", category: "Heap", order: 53 },
  { id: "task-scheduler", title: "Task Scheduler", slug: "task-scheduler", difficulty: "Medium", category: "Heap", order: 54 },
  { id: "find-median-from-data-stream", title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "Hard", category: "Heap", order: 55 },
  { id: "merge-k-sorted-lists", title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard", category: "Heap", order: 56 },

  // Tries (2)
  { id: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree", difficulty: "Medium", category: "Tries", order: 57 },
  { id: "word-break", title: "Word Break", slug: "word-break", difficulty: "Medium", category: "Tries", order: 58 },

  // Graphs (10)
  { id: "flood-fill", title: "Flood Fill", slug: "flood-fill", difficulty: "Easy", category: "Graphs", order: 59 },
  { id: "01-matrix", title: "01 Matrix", slug: "01-matrix", difficulty: "Medium", category: "Graphs", order: 60 },
  { id: "clone-graph", title: "Clone Graph", slug: "clone-graph", difficulty: "Medium", category: "Graphs", order: 61 },
  { id: "course-schedule", title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", category: "Graphs", order: 62 },
  { id: "number-of-islands", title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", category: "Graphs", order: 63 },
  { id: "rotting-oranges", title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "Medium", category: "Graphs", order: 64 },
  { id: "accounts-merge", title: "Accounts Merge", slug: "accounts-merge", difficulty: "Medium", category: "Graphs", order: 65 },
  { id: "word-search", title: "Word Search", slug: "word-search", difficulty: "Medium", category: "Graphs", order: 66 },
  { id: "minimum-height-trees", title: "Minimum Height Trees", slug: "minimum-height-trees", difficulty: "Medium", category: "Graphs", order: 67 },
  { id: "word-ladder", title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", category: "Graphs", order: 68 },

  // Dynamic Programming (6)
  { id: "climbing-stairs", title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", category: "Dynamic Programming", order: 69 },
  { id: "maximum-subarray", title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", category: "Dynamic Programming", order: 70 },
  { id: "coin-change", title: "Coin Change", slug: "coin-change", difficulty: "Medium", category: "Dynamic Programming", order: 71 },
  { id: "partition-equal-subset-sum", title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", difficulty: "Medium", category: "Dynamic Programming", order: 72 },
  { id: "unique-paths", title: "Unique Paths", slug: "unique-paths", difficulty: "Medium", category: "Dynamic Programming", order: 73 },
  { id: "maximum-profit-in-job-scheduling", title: "Maximum Profit in Job Scheduling", slug: "maximum-profit-in-job-scheduling", difficulty: "Hard", category: "Dynamic Programming", order: 74 },

  // Bit Manipulation (1)
  { id: "add-binary", title: "Add Binary", slug: "add-binary", difficulty: "Easy", category: "Bit Manipulation", order: 75 },
];
