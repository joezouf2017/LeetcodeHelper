// lib/lists/neetcode150.ts
// Static NeetCode 150 catalog — 150 problems across 18 categories.
// Source of truth for topic order/grouping: neetcode.io/practice (NeetCode 150 list).
// `slug` is the LeetCode URL slug: https://leetcode.com/problems/<slug>/
// `premium` problems are LeetCode-Premium-locked; `freeUrl` gives a non-LeetCode
// mirror (LintCode) where NeetCode himself points people who don't have Premium.

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Neetcode150Problem {
  id: string;            // stable slug-based id, e.g. "two-sum"
  title: string;
  slug: string;           // leetcode.com/problems/<slug>/
  difficulty: Difficulty;
  category: string;       // one of NEETCODE150_CATEGORIES
  premium?: boolean;      // true if locked behind LeetCode Premium
  freeUrl?: string;       // free mirror, only set when premium is true
}

// Canonical category order, matches the NeetCode roadmap grouping.
export const NEETCODE150_CATEGORIES = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
] as const;

export const NEETCODE150: Neetcode150Problem[] = [
  // Arrays & Hashing (9)
  { id: "contains-duplicate", title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", category: "Arrays & Hashing" },
  { id: "valid-anagram", title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", category: "Arrays & Hashing" },
  { id: "two-sum", title: "Two Sum", slug: "two-sum", difficulty: "Easy", category: "Arrays & Hashing" },
  { id: "group-anagrams", title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: "top-k-frequent-elements", title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: "product-of-array-except-self", title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: "valid-sudoku", title: "Valid Sudoku", slug: "valid-sudoku", difficulty: "Medium", category: "Arrays & Hashing" },
  { id: "encode-and-decode-strings", title: "Encode and Decode Strings", slug: "encode-and-decode-strings", difficulty: "Medium", category: "Arrays & Hashing", premium: true, freeUrl: "https://www.lintcode.com/problem/659/" },
  { id: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", difficulty: "Medium", category: "Arrays & Hashing" },

  // Two Pointers (5)
  { id: "valid-palindrome", title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", category: "Two Pointers" },
  { id: "two-sum-ii-input-array-is-sorted", title: "Two Sum II - Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted", difficulty: "Medium", category: "Two Pointers" },
  { id: "3sum", title: "3Sum", slug: "3sum", difficulty: "Medium", category: "Two Pointers" },
  { id: "container-with-most-water", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", category: "Two Pointers" },
  { id: "trapping-rain-water", title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", category: "Two Pointers" },

  // Sliding Window (6)
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", category: "Sliding Window" },
  { id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", category: "Sliding Window" },
  { id: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", difficulty: "Medium", category: "Sliding Window" },
  { id: "permutation-in-string", title: "Permutation in String", slug: "permutation-in-string", difficulty: "Medium", category: "Sliding Window" },
  { id: "minimum-window-substring", title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", category: "Sliding Window" },
  { id: "sliding-window-maximum", title: "Sliding Window Maximum", slug: "sliding-window-maximum", difficulty: "Hard", category: "Sliding Window" },

  // Stack (7)
  { id: "valid-parentheses", title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", category: "Stack" },
  { id: "min-stack", title: "Min Stack", slug: "min-stack", difficulty: "Medium", category: "Stack" },
  { id: "evaluate-reverse-polish-notation", title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", difficulty: "Medium", category: "Stack" },
  { id: "generate-parentheses", title: "Generate Parentheses", slug: "generate-parentheses", difficulty: "Medium", category: "Stack" },
  { id: "daily-temperatures", title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "Medium", category: "Stack" },
  { id: "car-fleet", title: "Car Fleet", slug: "car-fleet", difficulty: "Medium", category: "Stack" },
  { id: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "Hard", category: "Stack" },

  // Binary Search (7)
  { id: "binary-search", title: "Binary Search", slug: "binary-search", difficulty: "Easy", category: "Binary Search" },
  { id: "search-a-2d-matrix", title: "Search a 2D Matrix", slug: "search-a-2d-matrix", difficulty: "Medium", category: "Binary Search" },
  { id: "koko-eating-bananas", title: "Koko Eating Bananas", slug: "koko-eating-bananas", difficulty: "Medium", category: "Binary Search" },
  { id: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", difficulty: "Medium", category: "Binary Search" },
  { id: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", category: "Binary Search" },
  { id: "time-based-key-value-store", title: "Time Based Key-Value Store", slug: "time-based-key-value-store", difficulty: "Medium", category: "Binary Search" },
  { id: "median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "Hard", category: "Binary Search" },

  // Linked List (11)
  { id: "reverse-linked-list", title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", category: "Linked List" },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", category: "Linked List" },
  { id: "reorder-list", title: "Reorder List", slug: "reorder-list", difficulty: "Medium", category: "Linked List" },
  { id: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: "Medium", category: "Linked List" },
  { id: "copy-list-with-random-pointer", title: "Copy List with Random Pointer", slug: "copy-list-with-random-pointer", difficulty: "Medium", category: "Linked List" },
  { id: "add-two-numbers", title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "Medium", category: "Linked List" },
  { id: "linked-list-cycle", title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "Easy", category: "Linked List" },
  { id: "find-the-duplicate-number", title: "Find the Duplicate Number", slug: "find-the-duplicate-number", difficulty: "Medium", category: "Linked List" },
  { id: "lru-cache", title: "LRU Cache", slug: "lru-cache", difficulty: "Medium", category: "Linked List" },
  { id: "merge-k-sorted-lists", title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard", category: "Linked List" },
  { id: "reverse-nodes-in-k-group", title: "Reverse Nodes in k-Group", slug: "reverse-nodes-in-k-group", difficulty: "Hard", category: "Linked List" },

  // Trees (15)
  { id: "invert-binary-tree", title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", category: "Trees" },
  { id: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", category: "Trees" },
  { id: "diameter-of-binary-tree", title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree", difficulty: "Easy", category: "Trees" },
  { id: "balanced-binary-tree", title: "Balanced Binary Tree", slug: "balanced-binary-tree", difficulty: "Easy", category: "Trees" },
  { id: "same-tree", title: "Same Tree", slug: "same-tree", difficulty: "Easy", category: "Trees" },
  { id: "subtree-of-another-tree", title: "Subtree of Another Tree", slug: "subtree-of-another-tree", difficulty: "Easy", category: "Trees" },
  { id: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium", category: "Trees" },
  { id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", category: "Trees" },
  { id: "binary-tree-right-side-view", title: "Binary Tree Right Side View", slug: "binary-tree-right-side-view", difficulty: "Medium", category: "Trees" },
  { id: "count-good-nodes-in-binary-tree", title: "Count Good Nodes in Binary Tree", slug: "count-good-nodes-in-binary-tree", difficulty: "Medium", category: "Trees" },
  { id: "validate-binary-search-tree", title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "Medium", category: "Trees" },
  { id: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", difficulty: "Medium", category: "Trees" },
  { id: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", difficulty: "Medium", category: "Trees" },
  { id: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", difficulty: "Hard", category: "Trees" },
  { id: "serialize-and-deserialize-binary-tree", title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", difficulty: "Hard", category: "Trees" },

  // Tries (3)
  { id: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree", difficulty: "Medium", category: "Tries" },
  { id: "design-add-and-search-words-data-structure", title: "Design Add and Search Words Data Structure", slug: "design-add-and-search-words-data-structure", difficulty: "Medium", category: "Tries" },
  { id: "word-search-ii", title: "Word Search II", slug: "word-search-ii", difficulty: "Hard", category: "Tries" },

  // Heap / Priority Queue (7)
  { id: "kth-largest-element-in-a-stream", title: "Kth Largest Element in a Stream", slug: "kth-largest-element-in-a-stream", difficulty: "Easy", category: "Heap / Priority Queue" },
  { id: "last-stone-weight", title: "Last Stone Weight", slug: "last-stone-weight", difficulty: "Easy", category: "Heap / Priority Queue" },
  { id: "k-closest-points-to-origin", title: "K Closest Points to Origin", slug: "k-closest-points-to-origin", difficulty: "Medium", category: "Heap / Priority Queue" },
  { id: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", difficulty: "Medium", category: "Heap / Priority Queue" },
  { id: "task-scheduler", title: "Task Scheduler", slug: "task-scheduler", difficulty: "Medium", category: "Heap / Priority Queue" },
  { id: "design-twitter", title: "Design Twitter", slug: "design-twitter", difficulty: "Medium", category: "Heap / Priority Queue" },
  { id: "find-median-from-data-stream", title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "Hard", category: "Heap / Priority Queue" },

  // Backtracking (9)
  { id: "subsets", title: "Subsets", slug: "subsets", difficulty: "Medium", category: "Backtracking" },
  { id: "combination-sum", title: "Combination Sum", slug: "combination-sum", difficulty: "Medium", category: "Backtracking" },
  { id: "permutations", title: "Permutations", slug: "permutations", difficulty: "Medium", category: "Backtracking" },
  { id: "subsets-ii", title: "Subsets II", slug: "subsets-ii", difficulty: "Medium", category: "Backtracking" },
  { id: "combination-sum-ii", title: "Combination Sum II", slug: "combination-sum-ii", difficulty: "Medium", category: "Backtracking" },
  { id: "word-search", title: "Word Search", slug: "word-search", difficulty: "Medium", category: "Backtracking" },
  { id: "palindrome-partitioning", title: "Palindrome Partitioning", slug: "palindrome-partitioning", difficulty: "Medium", category: "Backtracking" },
  { id: "letter-combinations-of-a-phone-number", title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", difficulty: "Medium", category: "Backtracking" },
  { id: "n-queens", title: "N-Queens", slug: "n-queens", difficulty: "Hard", category: "Backtracking" },

  // Graphs (13)
  { id: "number-of-islands", title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", category: "Graphs" },
  { id: "clone-graph", title: "Clone Graph", slug: "clone-graph", difficulty: "Medium", category: "Graphs" },
  { id: "max-area-of-island", title: "Max Area of Island", slug: "max-area-of-island", difficulty: "Medium", category: "Graphs" },
  { id: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", difficulty: "Medium", category: "Graphs" },
  { id: "surrounded-regions", title: "Surrounded Regions", slug: "surrounded-regions", difficulty: "Medium", category: "Graphs" },
  { id: "rotting-oranges", title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "Medium", category: "Graphs" },
  { id: "walls-and-gates", title: "Walls and Gates", slug: "walls-and-gates", difficulty: "Medium", category: "Graphs", premium: true, freeUrl: "https://www.lintcode.com/problem/663/" },
  { id: "course-schedule", title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", category: "Graphs" },
  { id: "course-schedule-ii", title: "Course Schedule II", slug: "course-schedule-ii", difficulty: "Medium", category: "Graphs" },
  { id: "redundant-connection", title: "Redundant Connection", slug: "redundant-connection", difficulty: "Medium", category: "Graphs" },
  { id: "number-of-connected-components-in-an-undirected-graph", title: "Number of Connected Components in an Undirected Graph", slug: "number-of-connected-components-in-an-undirected-graph", difficulty: "Medium", category: "Graphs", premium: true, freeUrl: "https://www.lintcode.com/problem/3651/" },
  { id: "graph-valid-tree", title: "Graph Valid Tree", slug: "graph-valid-tree", difficulty: "Medium", category: "Graphs", premium: true, freeUrl: "https://www.lintcode.com/problem/178/" },
  { id: "word-ladder", title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", category: "Graphs" },

  // Advanced Graphs (6)
  { id: "reconstruct-itinerary", title: "Reconstruct Itinerary", slug: "reconstruct-itinerary", difficulty: "Hard", category: "Advanced Graphs" },
  { id: "min-cost-to-connect-all-points", title: "Min Cost to Connect All Points", slug: "min-cost-to-connect-all-points", difficulty: "Medium", category: "Advanced Graphs" },
  { id: "network-delay-time", title: "Network Delay Time", slug: "network-delay-time", difficulty: "Medium", category: "Advanced Graphs" },
  { id: "swim-in-rising-water", title: "Swim in Rising Water", slug: "swim-in-rising-water", difficulty: "Hard", category: "Advanced Graphs" },
  { id: "alien-dictionary", title: "Alien Dictionary", slug: "alien-dictionary", difficulty: "Hard", category: "Advanced Graphs", premium: true, freeUrl: "https://www.lintcode.com/problem/892/" },
  { id: "cheapest-flights-within-k-stops", title: "Cheapest Flights Within K Stops", slug: "cheapest-flights-within-k-stops", difficulty: "Medium", category: "Advanced Graphs" },

  // 1-D Dynamic Programming (12)
  { id: "climbing-stairs", title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", category: "1-D Dynamic Programming" },
  { id: "min-cost-climbing-stairs", title: "Min Cost Climbing Stairs", slug: "min-cost-climbing-stairs", difficulty: "Easy", category: "1-D Dynamic Programming" },
  { id: "house-robber", title: "House Robber", slug: "house-robber", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "house-robber-ii", title: "House Robber II", slug: "house-robber-ii", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "longest-palindromic-substring", title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "palindromic-substrings", title: "Palindromic Substrings", slug: "palindromic-substrings", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "decode-ways", title: "Decode Ways", slug: "decode-ways", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "coin-change", title: "Coin Change", slug: "coin-change", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "maximum-product-subarray", title: "Maximum Product Subarray", slug: "maximum-product-subarray", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "word-break", title: "Word Break", slug: "word-break", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: "Medium", category: "1-D Dynamic Programming" },
  { id: "partition-equal-subset-sum", title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", difficulty: "Medium", category: "1-D Dynamic Programming" },

  // 2-D Dynamic Programming (11)
  { id: "unique-paths", title: "Unique Paths", slug: "unique-paths", difficulty: "Medium", category: "2-D Dynamic Programming" },
  { id: "longest-common-subsequence", title: "Longest Common Subsequence", slug: "longest-common-subsequence", difficulty: "Medium", category: "2-D Dynamic Programming" },
  { id: "best-time-to-buy-and-sell-stock-with-cooldown", title: "Best Time to Buy and Sell Stock with Cooldown", slug: "best-time-to-buy-and-sell-stock-with-cooldown", difficulty: "Medium", category: "2-D Dynamic Programming" },
  { id: "coin-change-ii", title: "Coin Change II", slug: "coin-change-ii", difficulty: "Medium", category: "2-D Dynamic Programming" },
  { id: "target-sum", title: "Target Sum", slug: "target-sum", difficulty: "Medium", category: "2-D Dynamic Programming" },
  { id: "interleaving-string", title: "Interleaving String", slug: "interleaving-string", difficulty: "Medium", category: "2-D Dynamic Programming" },
  { id: "longest-increasing-path-in-a-matrix", title: "Longest Increasing Path in a Matrix", slug: "longest-increasing-path-in-a-matrix", difficulty: "Hard", category: "2-D Dynamic Programming" },
  { id: "distinct-subsequences", title: "Distinct Subsequences", slug: "distinct-subsequences", difficulty: "Hard", category: "2-D Dynamic Programming" },
  { id: "edit-distance", title: "Edit Distance", slug: "edit-distance", difficulty: "Medium", category: "2-D Dynamic Programming" },
  { id: "burst-balloons", title: "Burst Balloons", slug: "burst-balloons", difficulty: "Hard", category: "2-D Dynamic Programming" },
  { id: "regular-expression-matching", title: "Regular Expression Matching", slug: "regular-expression-matching", difficulty: "Hard", category: "2-D Dynamic Programming" },

  // Greedy (8)
  { id: "maximum-subarray", title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", category: "Greedy" },
  { id: "jump-game", title: "Jump Game", slug: "jump-game", difficulty: "Medium", category: "Greedy" },
  { id: "jump-game-ii", title: "Jump Game II", slug: "jump-game-ii", difficulty: "Medium", category: "Greedy" },
  { id: "gas-station", title: "Gas Station", slug: "gas-station", difficulty: "Medium", category: "Greedy" },
  { id: "hand-of-straights", title: "Hand of Straights", slug: "hand-of-straights", difficulty: "Medium", category: "Greedy" },
  { id: "merge-triplets-to-form-target-triplet", title: "Merge Triplets to Form Target Triplet", slug: "merge-triplets-to-form-target-triplet", difficulty: "Medium", category: "Greedy" },
  { id: "partition-labels", title: "Partition Labels", slug: "partition-labels", difficulty: "Medium", category: "Greedy" },
  { id: "valid-parenthesis-string", title: "Valid Parenthesis String", slug: "valid-parenthesis-string", difficulty: "Medium", category: "Greedy" },

  // Intervals (6)
  { id: "insert-interval", title: "Insert Interval", slug: "insert-interval", difficulty: "Medium", category: "Intervals" },
  { id: "merge-intervals", title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", category: "Intervals" },
  { id: "non-overlapping-intervals", title: "Non-overlapping Intervals", slug: "non-overlapping-intervals", difficulty: "Medium", category: "Intervals" },
  { id: "meeting-rooms", title: "Meeting Rooms", slug: "meeting-rooms", difficulty: "Easy", category: "Intervals", premium: true, freeUrl: "https://www.lintcode.com/problem/920/" },
  { id: "meeting-rooms-ii", title: "Meeting Rooms II", slug: "meeting-rooms-ii", difficulty: "Medium", category: "Intervals", premium: true, freeUrl: "https://www.lintcode.com/problem/919/" },
  { id: "minimum-interval-to-include-each-query", title: "Minimum Interval to Include Each Query", slug: "minimum-interval-to-include-each-query", difficulty: "Hard", category: "Intervals" },

  // Math & Geometry (8)
  { id: "rotate-image", title: "Rotate Image", slug: "rotate-image", difficulty: "Medium", category: "Math & Geometry" },
  { id: "spiral-matrix", title: "Spiral Matrix", slug: "spiral-matrix", difficulty: "Medium", category: "Math & Geometry" },
  { id: "set-matrix-zeroes", title: "Set Matrix Zeroes", slug: "set-matrix-zeroes", difficulty: "Medium", category: "Math & Geometry" },
  { id: "happy-number", title: "Happy Number", slug: "happy-number", difficulty: "Easy", category: "Math & Geometry" },
  { id: "plus-one", title: "Plus One", slug: "plus-one", difficulty: "Easy", category: "Math & Geometry" },
  { id: "powx-n", title: "Pow(x, n)", slug: "powx-n", difficulty: "Medium", category: "Math & Geometry" },
  { id: "multiply-strings", title: "Multiply Strings", slug: "multiply-strings", difficulty: "Medium", category: "Math & Geometry" },
  { id: "detect-squares", title: "Detect Squares", slug: "detect-squares", difficulty: "Medium", category: "Math & Geometry" },

  // Bit Manipulation (7)
  { id: "single-number", title: "Single Number", slug: "single-number", difficulty: "Easy", category: "Bit Manipulation" },
  { id: "number-of-1-bits", title: "Number of 1 Bits", slug: "number-of-1-bits", difficulty: "Easy", category: "Bit Manipulation" },
  { id: "counting-bits", title: "Counting Bits", slug: "counting-bits", difficulty: "Easy", category: "Bit Manipulation" },
  { id: "reverse-bits", title: "Reverse Bits", slug: "reverse-bits", difficulty: "Easy", category: "Bit Manipulation" },
  { id: "missing-number", title: "Missing Number", slug: "missing-number", difficulty: "Easy", category: "Bit Manipulation" },
  { id: "sum-of-two-integers", title: "Sum of Two Integers", slug: "sum-of-two-integers", difficulty: "Medium", category: "Bit Manipulation" },
  { id: "reverse-integer", title: "Reverse Integer", slug: "reverse-integer", difficulty: "Medium", category: "Bit Manipulation" },
];

// Sanity checks you can run with ts-node / a quick test:
//   NEETCODE150.length === 150
//   new Set(NEETCODE150.map(p => p.id)).size === 150   (no duplicate ids)
//   NEETCODE150.filter(p => p.premium).length === 7
