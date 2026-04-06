import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function TaskQuestions() {
  const { domain } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

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

  const questions = questionsMap[domain] || [];

  const handleSubmit = () => {
    if (!file) {
      alert("Please upload your PDF");
      return;
    }

    // 🔥 ALWAYS GET FRESH DATA
    const selectedDomains =
      JSON.parse(localStorage.getItem("domains")) || [];

    let completedDomains =
      JSON.parse(localStorage.getItem("completedDomains")) || [];

    const currentDomain = domain.trim();

    // ✅ Add current domain if not already completed
    if (!completedDomains.includes(currentDomain)) {
      completedDomains.push(currentDomain);
    }

    // ✅ Save updated completed domains
    localStorage.setItem(
      "completedDomains",
      JSON.stringify(completedDomains)
    );

    alert("PDF uploaded successfully ");

    // 🔥 FIND REMAINING DOMAINS
    const remainingDomains = selectedDomains.filter(
      (d) => !completedDomains.includes(d)
    );

    console.log("Selected:", selectedDomains);
    console.log("Completed:", completedDomains);
    console.log("Remaining:", remainingDomains);

    // ✅ REDIRECT LOGIC (FIXED)
    if (remainingDomains.length > 0) {
      navigate(`/tasks/${remainingDomains[0]}`);
    } else {
      localStorage.setItem("tasksDone", true);
      navigate("/interview");
    }
  };

  return (
    <div className="questions-page">

      <h1>{domain} Domain Questions</h1>

      <div className="questions-container">
        {questions.map((q, i) => (
          <p key={i} className="question">
            <b>{i + 1}.</b> {q}
          </p>
        ))}
      </div>

      <div className="instruction-box">
        📌 Upload all answers in a <b>single PDF</b>
      </div>

      <div className="upload-box">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleSubmit}>
          Submit PDF
        </button>
      </div>

    </div>
  );
}

export default TaskQuestions;