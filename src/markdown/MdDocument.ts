import {MdBlock, MdNode} from './MdNode'
import {IMdDocument, MdNodeTypeEnum} from './types'
import {MarkdownWriter} from './MarkdownWriter'

export class MdDocument extends MdNode implements IMdDocument {
  filename: string
  blocks: MdBlock[] = []
  constructor(filename: string) {
    super(MdNodeTypeEnum.document)
    this.filename = filename
  }

  Save(outputDirectory: string): void {
    const writer = new MarkdownWriter()
    writer.save(this, `${outputDirectory}/${this.filename}.md`)
  }
}
