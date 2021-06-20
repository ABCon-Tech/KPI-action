import * as core from '@actions/core'
import * as fs from 'fs'
import {MdDocument} from './MdDocument'
import {MdBlock, MdHeading, MdInline, MdParagraph, MdTable} from './MdNode'
import {MdNodeTypeEnum} from './types'

export class MarkdownWriter {
  //constructor(/*TODO MarkdownWriterOptions */) {}

  save(document: MdDocument, filename: string): void {
    const stream = fs.createWriteStream(filename)
    this.writeDocument(stream, document)
    stream.end()
  }

  private writeDocument(stream: fs.WriteStream, document: MdDocument): void {
    for (const block of document.blocks) {
      this.writeBlock(stream, block)
    }
  }

  private writeBlock(stream: fs.WriteStream, block: MdBlock): void {
    switch (block.nodeType) {
      case MdNodeTypeEnum.paragraph:
        this.writePragraph(stream, block as MdParagraph)
        break
      case MdNodeTypeEnum.heading:
        this.writeHeading(stream, block as MdHeading)
        break
      case MdNodeTypeEnum.table:
        this.writeTable(stream, block as MdTable)
        break
    }
  }

  writeTable(stream: fs.WriteStream, table: MdTable): void {
    stream.write('|')
    for (const column of table.columns) {
      this.writeInline(stream, column.content)
      stream.write('|')
    }
    stream.write('|')

    for (let i = 1; i < table.columns.length; i++) {
      const alignment = table.columns[i - 1].alignment
      alignment === 'center' ? stream.write(':') : stream.write(' ')
      stream.write('---')
      alignment !== 'left' ? stream.write(':') : stream.write(' ')
      stream.write('|')
    }

    for (const row of table.rows) {
      for (const cell of row) {
        this.writeInline(stream, cell)
        stream.write('|')
      }
    }
  }

  writeHeading(stream: fs.WriteStream, heading: MdHeading): void {
    for (let i = 1; i < heading.level; i++) {
      stream.write('#')
    }
    stream.write(' ')
    this.writeInline(stream, heading.content)
  }

  writeInline(stream: fs.WriteStream, content: MdInline): void {
    core.info(`Writer: ${content.content}`)
    stream.write(content.content)
  }

  writePragraph(stream: fs.WriteStream, paragraph: MdParagraph): void {
    for (const inline of paragraph.contents) {
      this.writeInline(stream, inline)
    }
    stream.write('\n')
  }
}
