// Template Definitions
const templates = {
  "business-letter": {
    name: "Business Letter",
    content: `
                    <h1>Business Letter</h1>
                    <p>[Your Company Name]<br>[Street Address]<br>[City, State ZIP]</p>
                    <p>[Date]</p>
                    <p>[Recipient Name]<br>[Company Name]<br>[Street Address]<br>[City, State ZIP]</p>
                    <p>Dear [Recipient Name],</p>
                    <p>Body of your letter...</p>
                    <p>Sincerely,<br>[Your Name]<br>[Your Title]</p>
                `,
  },
  report: {
    name: "Professional Report",
    content: `
                    <h1>Professional Report</h1>
                    <h2>Executive Summary</h2>
                    <p>[Brief overview of key findings and recommendations]</p>
                    <h2>Introduction</h2>
                    <p>[Background information and objectives]</p>
                    <h2>Methodology</h2>
                    <p>[Research methods and data collection]</p>
                    <h2>Findings</h2>
                    <p>[Detailed analysis and results]</p>
                    <h2>Recommendations</h2>
                    <p>[Actionable suggestions based on findings]</p>
                    <h2>Conclusion</h2>
                    <p>[Summary of key points]</p>
                `,
  },
  "meeting-minutes": {
    name: "Meeting Minutes",
    content: `
                    <h1>Meeting Minutes</h1>
                    <p><strong>Date:</strong> [Date]<br>
                    <strong>Time:</strong> [Start Time] - [End Time]<br>
                    <strong>Location:</strong> [Meeting Location]</p>
                    <h2>Attendees</h2>
                    <p>[List of attendees]</p>
                    <h2>Agenda Items</h2>
                    <ol>
                        <li>Topic 1
                            <ul>
                                <li>Discussion points</li>
                                <li>Decisions made</li>
                            </ul>
                        </li>
                    </ol>
                    <h2>Action Items</h2>
                    <ul>
                        <li>[Action Item] - Assigned to: [Name], Due: [Date]</li>
                    </ul>
                    <h2>Next Meeting</h2>
                    <p>Date: [Next meeting date]<br>
                    Time: [Next meeting time]<br>
                    Location: [Next meeting location]</p>
                `,
  },
  article: {
    name: "Article Template",
    content: `
                    <h1>Article Title</h1>
                    <p class="author">[Author Name]<br>[Date]</p>
                    <h2>Introduction</h2>
                    <p>[Opening paragraph that introduces the topic and captures reader interest]</p>
                    <h2>Main Body</h2>
                    <p>[Main content section 1]</p>
                    <h3>Subheading 1</h3>
                    <p>[Supporting details and evidence]</p>
                    <h3>Subheading 2</h3>
                    <p>[Additional points and analysis]</p>
                    <h2>Conclusion</h2>
                    <p>[Summary of key points and closing thoughts]</p>
                    <p class="references">References:<br>[List your sources here]</p>
                `,
  },
  proposal: {
    name: "Project Proposal",
    content: `
                    <h1>Project Proposal</h1>
                    <h2>Project Overview</h2>
                    <p>[Brief description of the project]</p>
                    <h2>Objectives</h2>
                    <ul>
                        <li>[Objective 1]</li>
                        <li>[Objective 2]</li>
                        <li>[Objective 3]</li>
                    </ul>
                    <h2>Scope</h2>
                    <p>[Project scope and boundaries]</p>
                    <h2>Timeline</h2>
                    <p>[Project timeline and milestones]</p>
                    <h2>Budget</h2>
                    <p>[Budget breakdown]</p>
                    <h2>Team</h2>
                    <p>[Team members and roles]</p>
                    <h2>Risk Assessment</h2>
                    <p>[Potential risks and mitigation strategies]</p>
                `,
  },
};

let editor;
let autoSaveTimeout;
const AUTOSAVE_DELAY = 2000;
const WORD_READ_TIME = 275; // words per minute

// Initialize Editor
DecoupledEditor.create(document.querySelector("#editor"), {
  placeholder: "Start typing your document...",
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "fontSize",
    "fontFamily",
    "fontColor",
    "fontBackgroundColor",
    "|",
    "alignment",
    "bulletedList",
    "numberedList",
    "|",
    "indent",
    "outdent",
    "|",
    "link",
    "blockQuote",
    "insertTable",
    "mediaEmbed",
    "imageUpload",
    "|",
    "undo",
    "redo",
  ],
  heading: {
    options: [
      { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
    ],
  },
})
  .then((newEditor) => {
    editor = newEditor;
    const toolbarContainer = document.querySelector("#toolbar-container");
    toolbarContainer.appendChild(editor.ui.view.toolbar.element);

    // Set up change handlers
    editor.model.document.on("change:data", () => {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(autoSave, AUTOSAVE_DELAY);
      showStatus("Changes pending...");
      updateDocumentStats();
      updateTableOfContents();
    });

    // Load initial content
    loadSavedContent();
  })
  .catch((error) => {
    console.error("Editor initialization failed:", error);
  });

// Document Statistics
function updateDocumentStats() {
  const content = editor.getData();
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).length;
  const characters = text.replace(/\s/g, "").length;
  const paragraphs = (content.match(/<p>/g) || []).length;
  const readingTime = Math.ceil(words / WORD_READ_TIME);

  document.getElementById("documentStats").innerHTML = `
            Words: ${words}<br>
            Characters: ${characters}<br>
            Paragraphs: ${paragraphs}<br>
            Reading Time: ${readingTime} min
        `;
}

// Table of Contents
function updateTableOfContents() {
  const content = editor.getData();
  const tocContainer = document.getElementById("tableOfContents");
  const headings = content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g) || [];

  tocContainer.innerHTML = headings
    .map((heading) => {
      const level = heading.match(/<h(\d)/)[1];
      const text = heading.replace(/<[^>]*>/g, "");
      return `<div class="toc-item toc-h${level}">${text}</div>`;
    })
    .join("");

  document.querySelectorAll(".toc-item").forEach((item) => {
    item.addEventListener("click", () => {
      const text = item.textContent;
      const element = document.evaluate(
        `//*[contains(text(),'${text}')]`,
        editor.editing.view.document.root,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// Autosave
function autoSave() {
  const content = editor.getData();
  localStorage.setItem("document-content", content);
  showStatus("All changes saved");
}

// Load saved content
function loadSavedContent() {
  const savedContent = localStorage.getItem("document-content");
  if (savedContent) {
    editor.setData(savedContent);
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
}

// Status display
function showStatus(message) {
  const status = document.getElementById("documentStatus");
  status.textContent = message;
  status.style.display = "block";
  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}

// Template insertion
document.getElementById("insertTemplate").addEventListener("click", () => {
  const templateMenu = document.createElement("div");
  templateMenu.className = "template-menu fade-in";
  templateMenu.style = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-color);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        `;

  templateMenu.innerHTML = `
            <h3>Choose a Template</h3>
            ${Object.entries(templates)
              .map(
                ([key, template]) => `
                <div class="template-item" data-template="${key}">
                    ${template.name}
                </div>
            `
              )
              .join("")}
        `;

  document.body.appendChild(templateMenu);

  // Add click handlers
  templateMenu.querySelectorAll(".template-item").forEach((item) => {
    item.addEventListener("click", () => {
      const template = templates[item.dataset.template];
      editor.setData(template.content);
      document.body.removeChild(templateMenu);
      showStatus(`${template.name} template inserted`);
    });
  });

  // Close on outside click
  document.addEventListener("click", function closeTemplate(e) {
    if (!templateMenu.contains(e.target) && e.target.id !== "insertTemplate") {
      document.body.removeChild(templateMenu);
      document.removeEventListener("click", closeTemplate);
    }
  });
});

// Share functionality
document.getElementById("shareDoc").addEventListener("click", () => {
  const content = editor.getData();
  const shareUrl = window.location.href + "?doc=" + btoa(content);

  navigator.clipboard.writeText(shareUrl).then(() => {
    showStatus("Share link copied to clipboard");
  });
});

// Image upload handling
document.getElementById("uploadImage").addEventListener("click", () => {
  document.getElementById("imageUpload").click();
});

document.getElementById("imageUpload").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result;
      editor.execute("insertImage", {
        source: imageUrl,
        alt: file.name,
      });
      showStatus("Image uploaded successfully");
    };

    reader.readAsDataURL(file);
  }
});

// Generate Table of Contents
document.getElementById("generateToc").addEventListener("click", () => {
  const headings =
    editor.getData().match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g) || [];
  let toc = '<h2>Table of Contents</h2><div class="generated-toc">';

  headings.forEach((heading) => {
    const level = heading.match(/<h(\d)/)[1];
    const text = heading.replace(/<[^>]*>/g, "");
    const indent = "&nbsp;".repeat((level - 1) * 4);
    toc += `<p>${indent}${text}</p>`;
  });

  toc += "</div><hr>";

  editor.model.change((writer) => {
    const insertPosition = editor.model.document.selection.getFirstPosition();
    editor.setData(toc + editor.getData());
  });

  showStatus("Table of Contents generated");
});

// PDF Export Function using pdfmake
document.getElementById("saveDoc").addEventListener("click", () => {
  const content = editor.getData();

  // Convert HTML to pdfmake format
  function htmlToPdfmake(htmlContent) {
    const container = document.createElement("div");
    container.innerHTML = htmlContent;

    function convertElement(element) {
      let result = [];

      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.trim()) {
            let text = { text: node.textContent };

            // Check parent element for styling
            if (element.tagName) {
              switch (element.tagName.toLowerCase()) {
                case "strong":
                case "b":
                  text.bold = true;
                  break;
                case "i":
                case "em":
                  text.italics = true;
                  break;
                case "u":
                  text.decoration = "underline";
                  break;
              }
            }
            result.push(text);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          switch (node.tagName.toLowerCase()) {
            case "h1":
              result.push({
                text: node.textContent,
                fontSize: 24,
                bold: true,
                margin: [0, 10, 0, 5],
              });
              break;
            case "h2":
              result.push({
                text: node.textContent,
                fontSize: 20,
                bold: true,
                margin: [0, 8, 0, 4],
              });
              break;
            case "h3":
              result.push({
                text: node.textContent,
                fontSize: 16,
                bold: true,
                margin: [0, 6, 0, 3],
              });
              break;
            case "p":
              result.push({ text: convertElement(node), margin: [0, 5, 0, 5] });
              break;
            case "ul":
              let list = { ul: [] };
              node.querySelectorAll("li").forEach((li) => {
                list.ul.push({ text: convertElement(li) });
              });
              result.push(list);
              break;
            case "ol":
              let orderedList = { ol: [] };
              node.querySelectorAll("li").forEach((li) => {
                orderedList.ol.push({ text: convertElement(li) });
              });
              result.push(orderedList);
              break;
            case "table":
              let tableBody = [];
              node.querySelectorAll("tr").forEach((tr) => {
                let row = [];
                tr.querySelectorAll("td, th").forEach((cell) => {
                  row.push({
                    text: cell.textContent.trim(),
                    bold: cell.tagName === "TH",
                  });
                });
                tableBody.push(row);
              });
              result.push({
                table: {
                  headerRows: 1,
                  body: tableBody,
                  widths: Array(tableBody[0]?.length || 0).fill("*"),
                },
                margin: [0, 5, 0, 5],
              });
              break;
            case "img":
              // Handle images (base64)
              if (node.src.startsWith("data:image")) {
                result.push({
                  image: node.src,
                  width: 200, // Default width, adjust as needed
                });
              }
              break;
            case "a":
              result.push({
                text: node.textContent,
                color: "blue",
                decoration: "underline",
                link: node.href,
              });
              break;
            default:
              result = result.concat(convertElement(node));
          }
        }
      });

      return result;
    }

    return convertElement(container);
  }

  // Create PDF definition
  const docDefinition = {
    content: htmlToPdfmake(content),
    defaultStyle: {
      fontSize: 12,
      lineHeight: 1.5,
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
    },
    pageMargins: [40, 60, 40, 60],
    footer: function (currentPage, pageCount) {
      return {
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: "center",
        margin: [0, 20, 0, 0],
      };
    },
  };

  // Generate and download PDF
  pdfMake
    .createPdf(docDefinition)
    .download(`document_${new Date().toISOString().slice(0, 10)}.pdf`);
  showStatus("PDF exported successfully");
});

// DOCX Export
document.getElementById("saveDocx").addEventListener("click", () => {
  const content = editor.getData();
  const blob = new Blob([content], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `document_${new Date().toISOString().slice(0, 10)}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
  showStatus("DOCX exported successfully");
});

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  showStatus("Theme updated");
});
