import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { endInterview, getInterview, getInterviewAudio, startInterview, uploadInterviewAudio, type AudioMetadata, type Interview } from "../services/api";

export default function Interview() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [code, setCode] = useState(`function twoSum(nums, target) {\n  // Write your solution here\n}`);
  const [runStatus, setRunStatus] = useState("Ready");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!interviewId) { setError("Interview ID is missing."); setLoading(false); return; }
    const id = interviewId;
    async function load() {
      try {
        setLoading(true); setError("");
        setInterview(await getInterview(id));
        try { setAudioMetadata(await getInterviewAudio(id)); } catch (err) { if (err instanceof Error && !err.message.toLowerCase().includes("audio not found")) setRecordingError(err.message); }
      } catch (err) { setError(err instanceof Error ? err.message : "Failed to load interview."); }
      finally { setLoading(false); }
    }
    load();
    return () => { mediaStreamRef.current?.getTracks().forEach(track => track.stop()); if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); };
  }, [interviewId]);

  const handleStartInterview = async () => { if (!interviewId) return; try { setActionLoading(true); setError(""); setInterview(await startInterview(interviewId)); } catch (err) { setError(err instanceof Error ? err.message : "Failed to start interview."); } finally { setActionLoading(false); } };
  const handleEndInterview = async () => { if (!interviewId) return; try { setActionLoading(true); setError(""); setInterview(await endInterview(interviewId)); } catch (err) { setError(err instanceof Error ? err.message : "Failed to end interview."); } finally { setActionLoading(false); } };

  const uploadAudio = async (blob: Blob, filename: string) => {
    if (!interviewId) return;
    try { setIsUploading(true); setRecordingError(""); const metadata = await uploadInterviewAudio(interviewId, blob, filename); setAudioMetadata(metadata); }
    catch (err) { setRecordingError(err instanceof Error ? err.message : "Failed to upload audio."); }
    finally { setIsUploading(false); }
  };

  const startRecording = async () => {
    if (!interviewId || audioMetadata) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setRecordingError("Audio recording is not supported by this browser."); return; }
    try {
      setRecordingError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = event => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = () => { const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }); const url = URL.createObjectURL(blob); if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = url; setAudioUrl(url); void uploadAudio(blob, "recording.webm"); stream.getTracks().forEach(track => track.stop()); };
      mediaStreamRef.current = stream; mediaRecorderRef.current = recorder; recorder.start(); setIsRecording(true);
    } catch (err) { setRecordingError(err instanceof Error ? err.message : "Microphone permission was denied."); }
  };
  const stopRecording = () => { mediaRecorderRef.current?.stop(); mediaRecorderRef.current = null; setIsRecording(false); };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setAudioUrl(null); await uploadAudio(file, file.name); event.target.value = ""; };

  if (loading) return <div className="interview-page"><div className="panel"><h2>Loading interview...</h2><p>Please wait while the interview is loaded.</p></div></div>;
  if (error || !interview) return <div className="interview-page"><div className="panel"><h2>Unable to load interview</h2><p>{error || "Interview not found."}</p><button className="secondary-button" onClick={() => navigate("/")}>Back to Dashboard</button></div></div>;

  return <div className="interview-page">
    <header className="interview-header"><div><p className="eyebrow">Technical Interview</p><h1>{interview.role}</h1><p className="candidate-name">Candidate: {interview.candidate_name}</p></div><div className="interview-meta"><span>Interview #{interview.id}</span><span className="status-dot">● {interview.status}</span></div></header>
    <main className="interview-workspace">
      <section className="question-panel panel"><div className="panel-header"><h2>Problem</h2><span className="difficulty">Medium</span></div><h3>Two Sum</h3><p>Given an array of integers and a target integer, return the indices of the two numbers such that they add up to the target.</p><h4>Example</h4><pre>{`Input:\nnums = [2, 7, 11, 15]\ntarget = 9\n\nOutput:\n[0, 1]`}</pre></section>
      <section className="analysis-panel panel"><div className="panel-header"><h2>Analysis</h2><span className="analysis-badge">Ready</span></div><div className="analysis-item"><span>🎙 Interview recording</span><strong>{audioMetadata ? "Uploaded" : "Not connected"}</strong></div><div className="analysis-item"><span>💻 Code activity</span><strong>Waiting</strong></div><div className="analysis-item"><span>🧠 Reasoning signals</span><strong>Waiting</strong></div><div className="analysis-item"><span>📊 Analysis engine</span><strong>Not started</strong></div></section>
      <section className="editor-panel panel"><div className="panel-header"><h2>Code</h2><span className="language-label">JavaScript</span></div><textarea className="code-editor" value={code} onChange={event => setCode(event.target.value)} spellCheck={false}/><div className="editor-footer"><span>Output: {runStatus}</span><button className="primary-button" onClick={() => { setRunStatus("Running..."); setTimeout(() => setRunStatus("Ready"), 1000); }}>Run Code</button></div></section>
      <section className="audio-panel panel"><div><h2>Interview Controls</h2><div className="recording-status"><span className={`recording-indicator ${isRecording ? "recording" : ""}`}/>{isRecording ? "Recording" : audioMetadata ? "Audio saved" : "Not recording"}</div></div>
        <div className="audio-controls"><div className="interview-lifecycle-controls">{interview.status === "CREATED" && <button className="primary-button" onClick={handleStartInterview} disabled={actionLoading}>{actionLoading ? "Starting..." : "Start Interview"}</button>}{interview.status === "IN_PROGRESS" && <button className="danger-button" onClick={handleEndInterview} disabled={actionLoading}>{actionLoading ? "Ending..." : "End Interview"}</button>}{interview.status === "COMPLETED" && <span className="completed-message">Interview completed</span>}</div>
          <button className={isRecording ? "danger-button" : "primary-button"} onClick={isRecording ? stopRecording : startRecording} disabled={isUploading || !!audioMetadata}>{isRecording ? "Stop & Upload" : "Start Recording"}</button>
          <label className="secondary-button" style={{ cursor: isUploading || !!audioMetadata ? "not-allowed" : "pointer" }}><input type="file" accept="audio/*" hidden onChange={handleFileUpload} disabled={isUploading || !!audioMetadata}/>{isUploading ? "Uploading..." : "Upload Audio"}</label>
          <button className="secondary-button" onClick={() => setIsMuted(!isMuted)}>{isMuted ? "Unmute" : "Mute"}</button>
        </div>
        {recordingError && <p role="alert">{recordingError}</p>}
        {audioUrl && <audio controls src={audioUrl} />}
        {audioMetadata && <p>Saved: {audioMetadata.original_filename || "recording"} · {(audioMetadata.file_size / 1024 / 1024).toFixed(2)} MB</p>}
      </section>
    </main>
  </div>;
}
