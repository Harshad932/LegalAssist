import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import '../assets/styles/CaseDetails.css';

const CaseDetails = () => {
  const location = useLocation();
  const caseData = location.state?.caseData;
  const printBtnRef = useRef(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Add event listener to the print button
    if (printBtnRef.current) {
      printBtnRef.current.addEventListener('click', generatePDF);
    }
    
    // Cleanup event listener on component unmount
    return () => {
      if (printBtnRef.current) {
        printBtnRef.current.removeEventListener('click', generatePDF);
      }
    };
  }, [caseData]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get the most recent hearing
  const getNextHearing = () => {
    if (!caseData.hearings || caseData.hearings.length === 0) {
      return null;
    }
    
    const futureHearings = caseData.hearings
      .filter(hearing => new Date(hearing.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return futureHearings.length > 0 ? futureHearings[0] : null;
  };

  // Generate and download PDF function
  const generatePDF = async () => {
    if (!caseData) return;

    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      // Get fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Set initial positions
      const margin = 50;
      let y = page.getHeight() - margin;
      const width = page.getWidth() - 2 * margin;
      
      // Helper function to add text to PDF
      const addText = (text, font, fontSize, x, yPos, options = {}) => {
        const { color = rgb(0, 0, 0), align = 'left' } = options;
        page.drawText(text, {
          x: align === 'center' ? x + (width / 2) - (font.widthOfTextAtSize(text, fontSize) / 2) : x,
          y: yPos,
          font,
          size: fontSize,
          color
        });
        return yPos - fontSize - 10; // Return new y position
      };
      
      // Add header
      y = addText('CASE DETAILS', helveticaBold, 20, margin, y, { align: 'center' });
      y -= 10; // Extra space after header

      // Add case title
      y = addText(caseData.caseTitle, helveticaBold, 16, margin, y);
      y -= 10; // Extra space after title
      
      // Add separator line
      page.drawLine({
        start: { x: margin, y },
        end: { x: page.getWidth() - margin, y },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      y -= 20; // Space after line
      
      // General Information section
      y = addText('General Information', helveticaBold, 14, margin, y);
      y -= 5;
      
      // Add details grid
      const details = [
        { label: 'Token Number:', value: caseData.tokenNumber },
        { label: 'Case Type:', value: caseData.caseType },
        { label: 'Filing Date:', value: formatDate(caseData.filingDate) },
        { label: 'Court:', value: caseData.court },
        { label: 'Judge:', value: caseData.judge },
        { label: 'Status:', value: caseData.status },
        { label: 'Priority:', value: caseData.priority || 'Medium' },
      ];
      
      if (caseData.firNumber) {
        details.push({ label: 'FIR Number:', value: caseData.firNumber });
      }
      
      details.forEach(detail => {
        y = addText(`${detail.label} ${detail.value}`, helveticaFont, 12, margin, y);
      });
      
      y -= 20; // Extra space
      
      // Parties section
      y = addText('Parties', helveticaBold, 14, margin, y);
      y -= 5;
      y = addText(`Petitioner: ${caseData.petitioner}`, helveticaFont, 12, margin, y);
      y = addText(`Respondent: ${caseData.respondent}`, helveticaFont, 12, margin, y);
      y -= 20; // Extra space
      
      // Next Hearing section
      const nextHearing = getNextHearing();
      if (nextHearing) {
        y = addText('Next Hearing', helveticaBold, 14, margin, y);
        y -= 5;
        y = addText(`Date: ${formatDate(nextHearing.date)}`, helveticaFont, 12, margin, y);
        y = addText(`Description: ${nextHearing.description}`, helveticaFont, 12, margin, y);
        y = addText(`Status: ${nextHearing.status}`, helveticaFont, 12, margin, y);
        y -= 20; // Extra space
      }
      
      // Hearing History section
      y = addText('Hearing History', helveticaBold, 14, margin, y);
      y -= 10;
      
      if (caseData.hearings && caseData.hearings.length > 0) {
        const sortedHearings = [...caseData.hearings].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedHearings.forEach((hearing, index) => {
          // Check if we need a new page
          if (y < 100) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = page.getHeight() - margin;
            y = addText('Hearing History (continued)', helveticaBold, 14, margin, y);
            y -= 10;
          }
          
          y = addText(`${formatDate(hearing.date)} - ${hearing.description}`, helveticaBold, 12, margin, y);
          y = addText(`Judge Remarks: ${hearing.judgeRemarks || 'No remarks provided'}`, helveticaFont, 12, margin + 10, y);
          y = addText(`Status: ${hearing.status}`, helveticaFont, 12, margin + 10, y);
          y -= 10; // Space between hearings
        });
      } else {
        y = addText('No hearings have been scheduled yet.', helveticaFont, 12, margin, y);
      }
      
      // Add footer
      page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: margin,
        y: 30,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a download link
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Case_${caseData.tokenNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!caseData) {
    return (
      <div className="case-details-container">
        <div className="case-details-container">
          <div className="not-found">
            <h2>Case Not Found</h2>
            <p>No case data is available. Please try searching again.</p>
            <Link to="/#track-case" className="btn btn-accent">Go Back</Link>
          </div>
        </div>
      </div>
    );
  }

  const nextHearing = getNextHearing();

  return (
    <div className="case-details-container">
      <div className="case-details-container">
        <div className="case-details-header">
          <h1>Case Details</h1>
          <span className={`status-badge ${caseData.status.toLowerCase()}`}>
            {caseData.status}
          </span>
        </div>

        <div className="case-details-card">
          <h2>{caseData.caseTitle}</h2>
          
          <div className="case-details-section">
            <h3>General Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Token Number:</span>
                <span className="detail-value">{caseData.tokenNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Case Type:</span>
                <span className="detail-value">{caseData.caseType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Filing Date:</span>
                <span className="detail-value">{formatDate(caseData.filingDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Court:</span>
                <span className="detail-value">{caseData.court}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Judge:</span>
                <span className="detail-value">{caseData.judge}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Priority:</span>
                <span className="detail-value">{caseData.priority || 'Medium'}</span>
              </div>
              {caseData.firNumber && (
                <div className="detail-item">
                  <span className="detail-label">FIR Number:</span>
                  <span className="detail-value">{caseData.firNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="case-details-section">
            <h3>Parties</h3>
            <div className="parties-container">
              <div className="party-item">
                <h4>Petitioner</h4>
                <p>{caseData.petitioner}</p>
              </div>
              <div className="party-item">
                <h4>Respondent</h4>
                <p>{caseData.respondent}</p>
              </div>
            </div>
          </div>

          {nextHearing && (
            <div className="case-details-section highlight-section">
              <h3>Next Hearing</h3>
              <div className="next-hearing">
                <p className="hearing-date">
                  <strong>Date:</strong> {formatDate(nextHearing.date)}
                </p>
                <p className="hearing-description">
                  <strong>Description:</strong> {nextHearing.description}
                </p>
                <p className="hearing-status">
                  <strong>Status:</strong> {nextHearing.status}
                </p>
              </div>
            </div>
          )}

          <div className="case-details-section">
            <h3>Hearing History</h3>
            {caseData.hearings && caseData.hearings.length > 0 ? (
              <div className="hearings-timeline">
                {caseData.hearings
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((hearing, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-date">
                        {formatDate(hearing.date)}
                      </div>
                      <div className="timeline-content">
                        <h4>{hearing.description}</h4>
                        <p className="judge-remarks">
                          <strong>Judge Remarks:</strong> {hearing.judgeRemarks || 'No remarks provided'}
                        </p>
                        <span className={`timeline-status ${hearing.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {hearing.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="no-hearings">No hearings have been scheduled yet.</p>
            )}
          </div>

          <div className="case-actions">
            <Link to="/#track-case" className="btn">Go Back</Link>
            <button className="btn btn-accent" ref={printBtnRef}>Print Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;