import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    endInterview,
    getInterview,
    startInterview,
    type Interview,
} from "../services/api";

export default function Interview() {
    const { interviewId } = useParams<{ interviewId: string }>();
    const navigate = useNavigate();

    // Interview API state
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Step 5 UI state
    const [isRecording, setIsRecording] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [runStatus, setRunStatus] = useState("Ready");

    const [code, setCode] = useState(`function twoSum(nums, target) {
  // Write your solution here
}`);

    useEffect(() => {
        if (!interviewId) {
            setError("Interview ID is missing.");
            setLoading(false);
            return;
        }

        const id = interviewId;

        async function loadInterview() {
            try {
                setLoading(true);
                setError("");

                const data = await getInterview(id);

                setInterview(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load interview."
                );
            } finally {
                setLoading(false);
            }
        }

        loadInterview();
    }, [interviewId]);

    // Start interview
    const handleStartInterview = async () => {
        if (!interviewId) return;

        try {
            setActionLoading(true);
            setError("");

            const updatedInterview = await startInterview(interviewId);

            setInterview(updatedInterview);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to start interview."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // End interview
    const handleEndInterview = async () => {
        if (!interviewId) return;

        try {
            setActionLoading(true);
            setError("");

            const updatedInterview = await endInterview(interviewId);

            setInterview(updatedInterview);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to end interview."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // Mock code execution for Step 5
    const handleRun = () => {
        setRunStatus("Running...");

        setTimeout(() => {
            setRunStatus("Ready");
        }, 1000);
    };

    // Loading state
    if (loading) {
        return (
            <div className="interview-page">
                <div className="panel">
                    <h2>Loading interview...</h2>
                    <p>Please wait while the interview is loaded.</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !interview) {
        return (
            <div className="interview-page">
                <div className="panel">
                    <h2>Unable to load interview</h2>

                    <p>
                        {error || "Interview not found."}
                    </p>

                    <button
                        className="secondary-button"
                        onClick={() => navigate("/")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="interview-page">
            <header className="interview-header">
                <div>
                    <p className="eyebrow">Technical Interview</p>

                    <h1>{interview.role}</h1>

                    <p className="candidate-name">
                        Candidate: {interview.candidate_name}
                    </p>
                </div>

                <div className="interview-meta">
                    <span>Interview #{interview.id}</span>

                    <span className="status-dot">
                        ● {interview.status}
                    </span>
                </div>
            </header>

            <main className="interview-workspace">

                {/* Question */}
                <section className="question-panel panel">
                    <div className="panel-header">
                        <h2>Problem</h2>
                        <span className="difficulty">Medium</span>
                    </div>

                    <h3>Two Sum</h3>

                    <p>
                        Given an array of integers and a target integer, return the
                        indices of the two numbers such that they add up to the target.
                    </p>

                    <h4>Example</h4>

                    <pre>
                        {`Input:
nums = [2, 7, 11, 15]
target = 9

Output:
[0, 1]`}
                    </pre>

                    <h4>Constraints</h4>

                    <ul>
                        <li>2 ≤ nums.length</li>
                        <li>Numbers may be positive or negative</li>
                        <li>There is exactly one valid answer</li>
                    </ul>
                </section>

                {/* Analysis */}
                <section className="analysis-panel panel">
                    <div className="panel-header">
                        <h2>Analysis</h2>
                        <span className="analysis-badge">Ready</span>
                    </div>

                    <div className="analysis-item">
                        <span>🎙 Interview recording</span>
                        <strong>Not connected</strong>
                    </div>

                    <div className="analysis-item">
                        <span>💻 Code activity</span>
                        <strong>Waiting</strong>
                    </div>

                    <div className="analysis-item">
                        <span>🧠 Reasoning signals</span>
                        <strong>Waiting</strong>
                    </div>

                    <div className="analysis-item">
                        <span>📊 Analysis engine</span>
                        <strong>Not started</strong>
                    </div>
                </section>

                {/* Code Editor */}
                <section className="editor-panel panel">
                    <div className="panel-header">
                        <h2>Code</h2>

                        <span className="language-label">
                            JavaScript
                        </span>
                    </div>

                    <textarea
                        className="code-editor"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        spellCheck={false}
                    />

                    <div className="editor-footer">
                        <span>Output: {runStatus}</span>

                        <div className="editor-actions">
                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setCode(`function twoSum(nums, target) {
  // Write your solution here
}`)
                                }
                            >
                                Reset
                            </button>

                            <button
                                className="primary-button"
                                onClick={handleRun}
                            >
                                Run Code
                            </button>
                        </div>
                    </div>
                </section>

                {/* Interview Controls */}
                <section className="audio-panel panel">
                    <div>
                        <h2>Interview Controls</h2>

                        <div className="recording-status">
                            <span
                                className={`recording-indicator ${isRecording ? "recording" : ""
                                    }`}
                            />

                            {isRecording
                                ? "Recording"
                                : "Not recording"}
                        </div>
                    </div>

                    <div className="audio-controls">

                        {/* Interview lifecycle */}
                        <div className="interview-lifecycle-controls">

                            {interview.status === "CREATED" && (
                                <button
                                    className="primary-button"
                                    onClick={handleStartInterview}
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Starting..."
                                        : "Start Interview"}
                                </button>
                            )}

                            {interview.status === "IN_PROGRESS" && (
                                <button
                                    className="danger-button"
                                    onClick={handleEndInterview}
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Ending..."
                                        : "End Interview"}
                                </button>
                            )}

                            {interview.status === "COMPLETED" && (
                                <span className="completed-message">
                                    Interview completed
                                </span>
                            )}

                        </div>

                        <span>00:00</span>

                        {/* Recording */}
                        <button
                            className={
                                isRecording
                                    ? "danger-button"
                                    : "primary-button"
                            }
                            onClick={() =>
                                setIsRecording(!isRecording)
                            }
                        >
                            {isRecording
                                ? "Stop Recording"
                                : "Start Recording"}
                        </button>

                        {/* Mute */}
                        <button
                            className="secondary-button"
                            onClick={() =>
                                setIsMuted(!isMuted)
                            }
                        >
                            {isMuted ? "Unmute" : "Mute"}
                        </button>

                    </div>
                </section>

            </main>
        </div>
    );
}