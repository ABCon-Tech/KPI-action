import {MdInlineBuilder} from './Builders'

export interface IMdDocument extends IMdNode {
  filename: string
}


export enum MdNodeTypeEnum {
  document,
  block_quote,
  list,
  item,
  paragraph,
  heading,
  emph,
  strong,
  link,
  image,
  custom_inline,
  custom_block,
  code_span,
  code_block,
  html_block,
  table,
  text
}

export interface IMdNode {
  nodeType: MdNodeTypeEnum
  parent?: IMdNode
  //isContainer: Boolean
  children?: IMdNode[]
}

export interface IMdBuilder {
  build(): any
}
export interface ContentPair {
  type: string
  content: MdInlineBuilder | string
}

export type Action<T> = (Arg: T) => void
export type MdHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type MdColumnAlignment = 'left' | 'center' | 'right'
