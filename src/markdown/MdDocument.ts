import { MdBlock, MdNode } from "./MdNode";
import { IMdDocument, IMdNode, MdNodeTypeEnum } from "./types";
import { MarkdownWriter } from "./MarkdownWriter";


export class MdDocument extends MdNode implements IMdDocument {
    filename: string
    blocks: Array<MdBlock> = [];
    constructor(filename: string) {
        super(MdNodeTypeEnum.document)
        this.filename = filename;
    }
                  
    async Save(outputDirectory: string) {
        var writer = new MarkdownWriter();
        await writer.save(this, outputDirectory +"/" + this.filename +".md")
      }
}


