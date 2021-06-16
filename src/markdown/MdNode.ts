import { IMdNode, MdNodeTypeEnum, MdHeadingLevel, MdColumnAlignment } from "./types";

export function isContainer(node:IMdNode) {
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
            return true;
        default:
            return false;
    }
}

export class MdNode implements IMdNode {
    constructor(nodeType: MdNodeTypeEnum, parent: IMdNode | undefined = undefined) {
        this.nodeType = nodeType
        this.parent = parent
    }

    nodeType: MdNodeTypeEnum;
    parent?: IMdNode;
    
    isContainer: boolean = isContainer(this);
    }

export class MdBlock extends MdNode {
    constructor(nodeType: MdNodeTypeEnum, parent?: IMdNode) {
        super(nodeType, parent)
    }

    children?: IMdNode[] | undefined;
}

export class MdContainerBlock extends MdBlock {
    constructor(nodeType: MdNodeTypeEnum, parent?: IMdNode) {
        super(nodeType, parent)
    }
    children: MdBlock[] = [];
}

export class MdLeafBlock extends MdBlock {
    constructor(nodeType: MdNodeTypeEnum, parent?: IMdNode) {
        super(nodeType, parent)
    }
    children: MdInline[] = [];
}

export class MdHeading extends MdBlock {
    level:MdHeadingLevel  = 1;
    content: MdInline;

    constructor( content:MdInline, level:MdHeadingLevel = 1, parent?: IMdNode,) {
        super(MdNodeTypeEnum.heading, parent)
        this.level = level;
        this.content = content;
    }
}

export class MdParagraph extends MdBlock {
    contents: MdInline[] = [];
    constructor(parent?: IMdNode) {
        super(MdNodeTypeEnum.paragraph, parent)
    }
}

export class MdTable extends MdBlock {
    columns: Array<MdTableColumn> =[]
    rows: Array<Array<MdInline>> =[]
    constructor(parent?: IMdNode) {
        super(MdNodeTypeEnum.table, parent)
    }
}
export class MdTableColumn {
    content: MdInline;
    alignment: MdColumnAlignment;
    constructor(content: MdInline, alignment: MdColumnAlignment = "left" ) {
        this.content = content;
        this.alignment = alignment
    }
}

export class MdInline extends MdNode {
    constructor(nodeType: MdNodeTypeEnum, parent?: IMdNode) {
        super(nodeType, parent)
    }
}