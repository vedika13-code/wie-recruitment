import { useParams, useNavigate } from "react-router-dom"; // Hooks: routing (URL params + navigation)
import { useState } from "react"; // Hook: state management

function TaskQuestions() { // Functional Component (Task Questions page)

  // Routing: get dynamic value from URL (e.g., /tasks/Technical)
  const { domain } = useParams();

  // Routing: navigation between pages
  const navigate = useNavigate();

  // State: stores uploaded file
  const [file, setFile] = useState(null);

  // Static data (questions based on domain)
  const questionsMap = {
    Technical: [
      "How do you see technology creating inclusive communities?",
      "Describe your strongest skill and what you're improving.",
      "Tell us about a technical challenge you faced.",
      "How would you lead an inclusive technical team?"
    ],
    Projects: [
      "Describe a project idea you would build.",
      "How do you approach problem-solving?",
      "Tell us about teamwork experience.",
      "How will your project create impact?"
    ],
    Publicity: [
      "How would you increase engagement?",
      "What content performs best?",
      "Campaign idea for WIE?",
      "How do you track trends?"
    ],
    Editorial: [
      "Write about IEEE WIE.",
      "How to make content engaging?",
      "Your writing style?",
      "How to document events?"
    ],
    Design: [
      "Tools you use?",
      "Visual storytelling approach?",
      "Design you're proud of?",
      "Brand consistency?"
    ],
    Management: [
      "Plan an event?",
      "Leadership experience?",
      "Handling pressure?",
      "Team coordination?"
    ]
  };

  // Dynamic data selection based on URL param
  const questions = questionsMap[domain] || [];

  // Event handling: form submission
  const handleSubmit = () => {

    // Validation: check if file uploaded
    if (!file) {
      alert("Please upload your PDF"); // Browser API
      return;
    }

    // LocalStorage: get selected domains
    const selectedDomains =
      JSON.parse(localStorage.getItem("domains")) || [];

    // LocalStorage: get completed domains
    let completedDomains =
      JSON.parse(localStorage.getItem("completedDomains")) || [];

    const currentDomain = domain.trim();

    // Logic: add current domain if not already completed
    if (!completedDomains.includes(currentDomain)) {
      completedDomains.push(currentDomain);
    }

    // Save updated completed domains
    localStorage.setItem(
      "completedDomains",
      JSON.stringify(completedDomains)
    );

    alert("PDF uploaded successfully ");

    // Logic: find remaining domains
    const remainingDomains = selectedDomains.filter(
      (d) => !completedDomains.includes(d)
    );

    // Debugging (console logs)
    console.log("Selected:", selectedDomains);
    console.log("Completed:", completedDomains);
    console.log("Remaining:", remainingDomains);

    // Routing logic (conditional navigation)
    if (remainingDomains.length > 0) {
      navigate(`/tasks/${remainingDomains[0]}`); // Go to next domain task
    } else {
      localStorage.setItem("tasksDone", true); // Save completion flag
      navigate("/interview"); // Go to interview page
    }
  };

  // JSX: UI structure
  return (
    <div className="questions-page"> {/* Styling */}

      {/* Dynamic heading */}
      <h1>{domain} Domain Questions</h1>

      {/* Dynamic rendering (mapping questions) */}
      <div className="questions-container">
        {questions.map((q, i) => ( // Loop through questions
          <p key={i} className="question"> {/* Key required */}
            <b>{i + 1}.</b> {q}
          </p>
        ))}
      </div>

      {/* Static JSX content */}
      <div className="instruction-box">
        📌 Upload all answers in a <b>single PDF</b>
      </div>

      {/* File upload + event handling */}
      <div className="upload-box">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])} // State update
        />

        <button onClick={handleSubmit}> {/* Event handling */}
          Submit PDF
        </button>
      </div>

    </div>
  );
}

export default TaskQuestions; // Export component