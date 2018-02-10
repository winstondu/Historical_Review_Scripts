// Get the document and body
var doc = DocumentApp.getActiveDocument();
var body = DocumentApp.getActiveDocument().getBody();

// Add the custom menu
function onOpen() {
  var ui = DocumentApp.getUi();
  
  ui.createMenu("Create Endnotes")
    .addItem('Run', 'newEnd')
    .addToUi();
}

// Break a new page at the end of the document 
// Add "Endnotes" title section
// Copy footnote contents into the new section as a numbered list
function newEnd() {
  
  body.appendPageBreak();
  body.appendParagraph('Endnotes').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  
  var footnote = doc.getFootnotes();
  var counter=1;
  doc.getBody().appendParagraph(""); // Create a single big paragraph in which all endnotes will belong
  for(var i in footnote){
    doc.getBody().appendParagraph("\n["+counter.toString()+"] ").merge(); // merge with that big paragraph.
    var footnote_section = footnote[i].getFootnoteContents().copy();
    var footnote_paragraphs = footnote_section.getNumChildren();
    for (var j = 0; j < footnote_paragraphs; ++j){
      var element = footnote_section.getChild(j).copy();
      var type = element.getType();
      if( type == DocumentApp.ElementType.PARAGRAPH ){
        doc.getBody().appendParagraph(element).merge(); // also merge in.
      }
      else if( type == DocumentApp.ElementType.LIST_ITEM){
        body.appendListItem(element);
      }
    }
    // doc.getBody().appendParagraph("["+counter.toString()+"]"+footnote[i].getFootnoteContents().copy().getText());
    counter++;
  }
  replaceNotes();
}

// Clears footnotes from the document.
function deleteNotes(){  
  var body = DocumentApp.getActiveDocument().getBody();
  var footnote = DocumentApp.getActiveDocument().getFootnotes();
  
  for(var i in footnote){
    footnote[i].removeFromParent();
  }
}

// Replaces note superscript where the old footnote was located.
function replaceNotes() {
  var par = body.getParagraphs();
  var notes = DocumentApp.getActiveDocument().getFootnotes();
  var note = 1;
  for(var i = 0; i < notes.length; i++){
    var getNote = notes[i].getPreviousSibling().editAsText();
    var length = notes[i].getPreviousSibling().editAsText().getText().length;
    var sup = getNote.insertText(length, (note++).toString());
    
    // Check that the footnote isn't double-digit. If it is, reset the index used to set the formatting
    if(note >= 11) {
      var newLength = sup.getText().length;
      Logger.log("length = " + length + ", newLength = " + newLength);
      sup.editAsText().setTextAlignment(length, newLength-1, DocumentApp.TextAlignment.SUPERSCRIPT);
    } 
      else {
      sup.editAsText().setTextAlignment(length, length, DocumentApp.TextAlignment.SUPERSCRIPT);
    }
  }
  deleteNotes();
}