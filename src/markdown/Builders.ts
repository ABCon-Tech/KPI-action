import * as core from '@actions/core'
import {MdDocument} from './MdDocument'
import {
  MdHeading,
  MdInline,
  MdParagraph,
  MdTable,
  MdTableColumn
} from './MdNode'
import {
  Action,
  ContentPair,
  IMdBuilder,
  MdColumnAlignment,
  MdHeadingLevel
} from './types'

abstract class AbstractBuilder<T> implements IMdBuilder {
  protected parent: IMdBuilder
  constructor(parent: IMdBuilder) {
    this.parent = parent
  }
  abstract build(): T
}

export class MdDocumentBuilder implements IMdBuilder {
  filename: string
  childBuilders: IMdBuilder[] = []
  constructor(filename: string) {
    this.filename = filename
  }

  build(): MdDocument {
    const doc = new MdDocument(this.filename)
    this.childBuilders.map(b => doc.blocks.push(b.build()))
    return doc
  }

  heading(buildHeading: Action<MdHeadingBuilder>): MdDocumentBuilder {
    const builder = new MdHeadingBuilder(this)
    buildHeading(builder)
    this.childBuilders.push(builder)
    return this
  }

  paragraph(buildParagraph: Action<MdParagraphBuilder>): MdDocumentBuilder {
    const builder = new MdParagraphBuilder(this)
    buildParagraph(builder)
    this.childBuilders.push(builder)
    return this
  }

  table(buildTable: Action<MdTableBuilder>): MdDocumentBuilder {
    const builder = new MdTableBuilder(this)
    buildTable(builder)
    this.childBuilders.push(builder)
    return this
  }
}

export class MdHeadingBuilder extends AbstractBuilder<MdHeading> {
  private contentBuilder!: MdInlineBuilder
  private _level: MdHeadingLevel = 1

  contentString(content: string): MdHeadingBuilder {
    this.content(i => i.text(content))
    return this
  }

  content(buildContent: Action<MdInlineBuilder>): MdHeadingBuilder {
    const builder = new MdInlineBuilder(this)
    buildContent(builder)
    this.contentBuilder = builder
    return this
  }

  level(level: MdHeadingLevel): MdHeadingBuilder {
    this._level = level
    return this
  }

  build(): MdHeading {
    const inline = this.contentBuilder.build()
    core.info(`MdHeadingBuilder.build => ${inline.content}`)
    return new MdHeading(this.contentBuilder.build(), this._level)
  }
}

export class MdParagraphBuilder extends AbstractBuilder<MdParagraph> {
  //private contents: ContentPair[] = []
  private inlineBuilder: MdInlineBuilder = new MdInlineBuilder(this)
  text(text: string): MdParagraphBuilder {
    this.inlineBuilder.text(text)
    return this
  }

  build(): MdParagraph {
    const paragraph = new MdParagraph()
    paragraph.contents.push(this.inlineBuilder.build())
    return paragraph
  }
}

export class MdInlineBuilder extends AbstractBuilder<MdInline> {
  //private contents: ContentPair[] = []
  private contents: Array<ContentPair> = []
  text(text: string): MdInlineBuilder {
    core.info(`MdInlineBuilder.text => ${text}`)
    this.contents.push({type: 'text', content: text})
    return this
  }

  build(): MdInline {
    let output = ''
    for (const part of this.contents) {
      core.info(`MdInlineBuilder.build => ${part.content.toString()}`)
      let text = part.content as string
      core.info(`MdInlineBuilder.build-cast => ${text}`)
      output = output + text
    }
    core.info(`MdInlineBuilder.build-finished => ${output}`)
    return MdInline.text(output)
  }
}

export class MdTableBuilder extends AbstractBuilder<MdTable> {
  columnCount = 0
  private columnbuilders: {
    alignment: MdColumnAlignment
    content: MdInlineBuilder
  }[] = []
  private rowsBuilder!: MdRowBuilder

  columnString(
    text: string,
    alignment: MdColumnAlignment = 'left'
  ): MdTableBuilder {
    this.column(i => i.text(text), alignment)
    return this
  }

  column(
    buildContent: Action<MdInlineBuilder>,
    alignment: MdColumnAlignment = 'left'
  ): MdTableBuilder {
    const builder = new MdInlineBuilder(this)
    buildContent(builder)
    this.columnbuilders.push({alignment, content: builder})
    return this
  }

  rows(buildRows: Action<MdRowBuilder>): MdTableBuilder {
    const builder = new MdRowBuilder(this)
    buildRows(builder)
    this.rowsBuilder = builder
    return this
  }

  build(): MdTable {
    const table = new MdTable()
    const columns = this.columnbuilders.map(
      c => new MdTableColumn(c.content.build(), c.alignment)
    )
    const rows = this.rowsBuilder.build()
    table.columns = columns
    table.rows = rows
    return table
  }
}

export class MdRowBuilder extends AbstractBuilder<MdInline[][]> {
  rows: MdInlineBuilder[][] = []
  row(values: string[]): MdRowBuilder {
    this.rows.push(values.map(v => new MdInlineBuilder(this).text(v)))
    return this
  }

  build(): MdInline[][] {
    return this.rows.map(r => r.map(b => b.build()))
  }
}
