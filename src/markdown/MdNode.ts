import {
  IMdNode,
  MdNodeTypeEnum,
  MdHeadingLevel,
  MdColumnAlignment
} from './types'

export function isContainer(node: IMdNode): Boolean {
  switch (node.nodeType) {
    case MdNodeTypeEnum.document:
    case MdNodeTypeEnum.block_quote:
    case MdNodeTypeEnum.list:
    case MdNodeTypeEnum.item:
    case MdNodeTypeEnum.paragraph:
    case MdNodeTypeEnum.heading:
    case MdNodeTypeEnum.emph:
    case MdNodeTypeEnum.strong:
    case MdNodeTypeEnum.link:
    case MdNodeTypeEnum.image:
    case MdNodeTypeEnum.custom_inline:
    case MdNodeTypeEnum.custom_block:
      return true
    default:
      return false
  }
}

export class MdNode implements IMdNode {
  constructor(
    nodeType: MdNodeTypeEnum,
    parent: IMdNode | undefined = undefined
  ) {
    this.nodeType = nodeType
    this.parent = parent
  }

  nodeType: MdNodeTypeEnum
  parent?: IMdNode
}

export class MdBlock extends MdNode {
  children?: IMdNode[] | undefined
}

export class MdContainerBlock extends MdBlock {
  children: MdBlock[] = []
}

export class MdHeading extends MdBlock {
  level: MdHeadingLevel = 1
  content: MdInline

  constructor(content: MdInline, level: MdHeadingLevel = 1, parent?: IMdNode) {
    super(MdNodeTypeEnum.heading, parent)
    this.level = level
    this.content = content
  }
}

export class MdParagraph extends MdBlock {
  contents: MdInline[] = []
  constructor(parent?: IMdNode) {
    super(MdNodeTypeEnum.paragraph, parent)
  }
}

export class MdTable extends MdBlock {
  columns: MdTableColumn[] = []
  rows: MdInline[][] = []
  constructor(parent?: IMdNode) {
    super(MdNodeTypeEnum.table, parent)
  }
}
export class MdTableColumn {
  content: MdInline
  alignment: MdColumnAlignment
  constructor(content: MdInline, alignment: MdColumnAlignment = 'left') {
    this.content = content
    this.alignment = alignment
  }
}

export class MdInline extends MdNode {
  content: string
  constructor(content: string, nodeType: MdNodeTypeEnum, parent?: IMdNode) {
    super(nodeType, parent)
    this.content = content;
  }

  static text(content:string):MdInline {
    return new MdInline(content, MdNodeTypeEnum.text)
  }
  static strong(content:string):MdInline {
    return new MdInline(content, MdNodeTypeEnum.strong)
  }
  static emphasis(content:string):MdInline {
    return new MdInline(content, MdNodeTypeEnum.emph)
  }
}
