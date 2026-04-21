/**
 * 单个拆分项的数据结构。
 *
 * 一个原始单词可能会被拆分成多个有语义的片段，
 * 例如 `indexRouter` 可以拆成 `index` 和 `Router`。
 */
export interface TermPart {
  /**
   * 拆分项的原始文本。
   */
  text: string;

  /**
   * 用户为该拆分项填写的解释备注。
   */
  note?: string;

  /**
   * 与该拆分项相关的标签集合。
   */
  tags: string[];

  /**
   * 拆分项所属的命名风格或来源类型。
   */
  type?: string;
}

/**
 * 词库中的完整词条结构。
 */
export interface TermEntry {
  /**
   * 词条唯一标识。
   */
  id: string;

  /**
   * 原始单词或标识符。
   */
  originalText: string;

  /**
   * 对整个单词的整体备注。
   */
  overallNote?: string;

  /**
   * 单词来源文件路径。
   */
  filePath?: string;

  /**
   * 拆分后的语义片段列表。
   */
  parts: TermPart[];

  /**
   * 词条级标签集合。
   */
  tags: string[];

  /**
   * 创建时间戳。
   */
  createdAt: number;

  /**
   * 最近更新时间戳。
   */
  updatedAt: number;

  /**
   * 掌握度，用于未来扩展复习能力。
   */
  mastery: number;

  /**
   * 已复习次数。
   */
  reviewCount: number;

  /**
   * 下次复习时间，可选。
   */
  nextReviewDate?: number;
}
