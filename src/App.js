import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";
import axios from "axios";
import { PDFDocument, PDFTextField, PDFDropdown, PDFRadioGroup } from "pdf-lib";

function App() {
  const [pdfData, setPdfData] = useState(null);
  const [modifiedPdfData, setModifiedPdfData] = useState("");

  const loadPdf = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/pdf/get-pdf");
      setPdfData(response.data);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const savePdf = async () => {
    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      fields.forEach((field) => {
        const fieldName = field.getName();
        if (field instanceof PDFTextField) {
          const modifiedValue = field.getText()
          console.log("modifiedValue", modifiedValue);
          if (modifiedValue) {
            field.setText(modifiedValue);
          }
        } else if (field instanceof PDFDropdown) {
          const modifiedSelectedIndex = field.getSelected();
          console.log("modifiedSelectedIndex", modifiedSelectedIndex);
          if (modifiedSelectedIndex >= 0) {
            field.select(modifiedSelectedIndex);
          }
        } else if (field instanceof PDFRadioGroup) {
          const modifiedSelectedValue = field.getSelected();
          console.log("modifiedSelectedValue", modifiedSelectedValue);
          if (modifiedSelectedValue) {
            field.select(modifiedSelectedValue);
          }
        }
      });

      const pdfBytes = await pdfDoc.save();
      const updatedPdfData = btoa(String.fromCharCode(...pdfBytes));

      setModifiedPdfData(updatedPdfData);

      await axios.post("http://localhost:3001/api/pdf/update-pdf", {
        pdfData: updatedPdfData,
      });
    } catch (error) {
      console.error("Error modifying PDF:", error);
    }
  };

  return (
    <div>
      <div className="Btn-div">
        <button onClick={loadPdf}>Load PDF</button>
        {pdfData && (
          <div>
            <button onClick={savePdf}>Save PDF</button>
          </div>
        )}
      </div>
      {pdfData && (
        <iframe
          src={`data:application/pdf;base64,${pdfData}`}
          title="PDF Viewer"
          width="800"
          height="600"
          className="Pdf-iframe-class"
        ></iframe>
      )}
    </div>
  );
}

export default App;
