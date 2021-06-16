import * as fs from "fs";
import { MdDocument } from "./MdDocument";
import { MdBlock, MdHeading, MdInline, MdParagraph, MdTable } from "./MdNode";
import { MdNodeTypeEnum } from "./types";

export class MarkdownWriter {

    constructor(/*TODO MarkdownWriterOptions */) {
    }

    async save(document: MdDocument, filename: string) {
        var stream = fs.createWriteStream(filename);
        this.writeDocument(stream, document);
    }

    private writeDocument(stream: fs.WriteStream, document: MdDocument) {
        for (const block of document.blocks) {
            this.writeBlock(stream,block)
        }
    }

    private writeBlock(stream: fs.WriteStream, block: MdBlock) {
        switch(block.nodeType){
            case MdNodeTypeEnum.paragraph:
                this.writePragraph(stream, block as MdParagraph)
            case MdNodeTypeEnum.heading:
                this.writeHeading(stream, block as MdHeading)
            case MdNodeTypeEnum.table:
                this.writeTable(stream, block as MdTable)
        }
    }

    writeTable(stream: fs.WriteStream, table: MdTable) {
        stream.write("|")
        for (const column of table.columns) {
            this.writeInline(stream, column.content)
            stream.write("|")
        }
        stream.write("|")

        for (let i = 1; i < table.columns.length; i++) {
            const alignment = table.columns[i-1].alignment;
            alignment == "center" ? stream.write(":") : stream.write(" ")
            stream.write("---")
            alignment != "left" ? stream.write(":") : stream.write(" ")
            stream.write("|")
        }

        for (const row of table.rows) {
            for(const cell of row) {
                this.writeInline(stream,cell)
                stream.write("|")
            }
        }
    }

    writeHeading(stream: fs.WriteStream, heading: MdHeading) {
        for (let i = 1; i < heading.level; i++) {
            stream.write("#");         
        }
        stream.write(" ");
        this.writeInline(stream,heading.content)
    }

    writeInline(stream: fs.WriteStream, content: MdInline) {
        
    }
    
    writePragraph(stream: fs.WriteStream, paragraph: MdParagraph) {
        for (const inline of paragraph.contents) {
            this.writeInline(stream, inline)
        }
        stream.write("\n")
    }

}


