import React, { useState } from 'react';
import { Hash, Shield, AlertTriangle, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SHA256Demo = () => {
  // State for basic hashing
  const [hashInput, setHashInput] = useState('');
  const [hashResult, setHashResult] = useState(null);
  const [hashLoading, setHashLoading] = useState(false);

  // State for reverse lookup
  const [reverseInput, setReverseInput] = useState('');
  const [reverseResult, setReverseResult] = useState(null);
  const [reverseLoading, setReverseLoading] = useState(false);

  // State for integrity check
  const [senderMessage, setSenderMessage] = useState('');
  const [senderResult, setSenderResult] = useState(null);
  const [mitm, setMitm] = useState('');
  const [receiverMessage, setReceiverMessage] = useState('');
  const [integrityResult, setIntegrityResult] = useState(null);
  const [integrityLoading, setIntegrityLoading] = useState(false);

  const API_BASE = 'http://localhost:3001/api';

  // Hash function
  const handleHash = async () => {
    if (!hashInput.trim()) return;
    
    setHashLoading(true);
    try {
      const response = await fetch(`${API_BASE}/hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: hashInput })
      });
      
      const data = await response.json();
      setHashResult(data);
    } catch (error) {
      console.error('Hash error:', error);
      setHashResult({ error: 'Failed to hash text' });
    }
    setHashLoading(false);
  };

  // Reverse lookup function
  const handleReverse = async () => {
    if (!reverseInput.trim()) return;
    
    setReverseLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: reverseInput })
      });
      
      const data = await response.json();
      setReverseResult(data);
    } catch (error) {
      console.error('Reverse error:', error);
      setReverseResult({ error: 'Failed to reverse hash' });
    }
    setReverseLoading(false);
  };

  // Sender side integrity setup
  const handleSenderSetup = async () => {
    if (!senderMessage.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE}/integrity/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: senderMessage })
      });
      
      const data = await response.json();
      setSenderResult(data);
      setMitm(senderMessage); // Initialize MITM field
      setReceiverMessage(senderMessage); // Initialize receiver field
      setIntegrityResult(null); // Clear previous results
    } catch (error) {
      console.error('Sender setup error:', error);
    }
  };

  // Update receiver message when MITM changes
  const handleMitmChange = (value) => {
    setMitm(value);
    setReceiverMessage(value);
  };

  // Integrity verification
  const handleIntegrityCheck = async () => {
    if (!senderResult || !receiverMessage.trim()) return;
    
    setIntegrityLoading(true);
    try {
      const response = await fetch(`${API_BASE}/integrity/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalMessage: senderResult.originalMessage,
          originalHash: senderResult.originalHash,
          receivedMessage: receiverMessage
        })
      });
      
      const data = await response.json();
      setIntegrityResult(data);
    } catch (error) {
      console.error('Integrity check error:', error);
      setIntegrityResult({ error: 'Failed to verify integrity' });
    }
    setIntegrityLoading(false);
  };

  const resetIntegrityDemo = () => {
    setSenderMessage('');
    setSenderResult(null);
    setMitm('');
    setReceiverMessage('');
    setIntegrityResult(null);
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">
            <Hash className="me-2" size={48} />
            SHA-256 Cryptographic Demo
          </h1>
          <p className="lead text-white-50">
            Explore hashing, reverse lookup simulation, and integrity verification
          </p>
        </div>

        {/* Basic Hashing and Reverse Lookup Row */}
        <div className="row mb-5">
          {/* Basic Hashing Section */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-lg h-100">
              <div className="card-header bg-success text-white">
                <h3 className="card-title mb-0">
                  <Hash className="me-2" size={24} />
                  Text to SHA-256 Hash
                </h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Enter text or numbers:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </div>
                
                <button
                  onClick={handleHash}
                  disabled={hashLoading || !hashInput.trim()}
                  className="btn btn-success w-100 mb-3"
                >
                  {hashLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Converting...
                    </>
                  ) : (
                    'Convert to Hash'
                  )}
                </button>

                {hashResult && (
                  <div className="bg-light p-3 rounded">
                    {hashResult.error ? (
                      <div className="alert alert-danger mb-0">{hashResult.error}</div>
                    ) : (
                      <div>
                        <small className="text-muted d-block mb-1">Original Text:</small>
                        <div className="bg-white p-2 rounded border mb-2" style={{fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all'}}>
                          {hashResult.originalText}
                        </div>
                        <small className="text-muted d-block mb-1">SHA-256 Hash:</small>
                        <div className="bg-white p-2 rounded border text-primary" style={{fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all'}}>
                          {hashResult.hash}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reverse Lookup Section */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-lg h-100">
              <div className="card-header bg-info text-white">
                <h3 className="card-title mb-0">
                  <RotateCcw className="me-2" size={24} />
                  Hash Reverse Lookup
                </h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Enter SHA-256 hash:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={reverseInput}
                    onChange={(e) => setReverseInput(e.target.value)}
                    placeholder="Paste hash here..."
                    style={{fontFamily: 'monospace', fontSize: '0.85rem'}}
                  />
                </div>
                
                <button
                  onClick={handleReverse}
                  disabled={reverseLoading || !reverseInput.trim()}
                  className="btn btn-info w-100 mb-3"
                >
                  {reverseLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Searching...
                    </>
                  ) : (
                    'Reverse Hash'
                  )}
                </button>

                {reverseResult && (
                  <div className="bg-light p-3 rounded">
                    {reverseResult.error ? (
                      <div className="alert alert-danger mb-0">{reverseResult.error}</div>
                    ) : (
                      <div>
                        <small className="text-muted d-block mb-1">Hash:</small>
                        <div className="bg-white p-2 rounded border mb-2" style={{fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all'}}>
                          {reverseResult.hash}
                        </div>
                        <small className="text-muted d-block mb-1">Result:</small>
                        {reverseResult.success ? (
                          <div className="bg-success bg-opacity-10 border border-success p-2 rounded" style={{fontFamily: 'monospace', fontSize: '0.85rem'}}>
                            {reverseResult.originalText}
                          </div>
                        ) : (
                          <div className="bg-danger bg-opacity-10 border border-danger p-2 rounded">
                            <small className="text-danger">Hash not found - SHA-256 cannot be reversed in practice</small>
                          </div>
                        )}
                        <small className="text-muted d-block mt-2">{reverseResult.note}</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Integrity Verification Section */}
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h3 className="card-title mb-0">
              <Shield className="me-2" size={24} />
              Message Integrity Verification Demo
            </h3>
            <button
              onClick={resetIntegrityDemo}
              className="btn btn-outline-light btn-sm"
              title="Reset Demo"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Sender */}
              <div className="col-md-4 mb-4">
                <div className="border border-success rounded p-3 h-100">
                  <h4 className="text-success mb-3">📤 Sender</h4>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Original Message:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                  </div>
                  
                  <button
                    onClick={handleSenderSetup}
                    disabled={!senderMessage.trim()}
                    className="btn btn-success w-100 mb-3"
                  >
                    Generate Hash
                  </button>

                  {senderResult && (
                    <div className="bg-success bg-opacity-10 border border-success rounded p-2">
                      <small className="text-muted d-block mb-1">Hash Generated:</small>
                      <div style={{fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all'}} className="text-success">
                        {senderResult.originalHash}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Man-in-the-Middle */}
              <div className="col-md-4 mb-4">
                <div className="border border-warning rounded p-3 h-100">
                  <h4 className="text-warning mb-3">🕵️ Man-in-the-Middle</h4>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Intercepted Message:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={mitm}
                      onChange={(e) => handleMitmChange(e.target.value)}
                      placeholder="Message in transit..."
                      disabled={!senderResult}
                    />
                  </div>
                  
                  <div className="text-center">
                    <ArrowRight className="text-warning mb-2" size={24} />
                    <small className="text-muted d-block">
                      Modify the message to simulate tampering
                    </small>
                  </div>
                </div>
              </div>

              {/* Receiver */}
              <div className="col-md-4 mb-4">
                <div className="border border-primary rounded p-3 h-100">
                  <h4 className="text-primary mb-3">📥 Receiver</h4>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Received Message:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={receiverMessage}
                      onChange={(e) => setReceiverMessage(e.target.value)}
                      placeholder="Received message..."
                      disabled={!senderResult}
                    />
                  </div>
                  
                  <button
                    onClick={handleIntegrityCheck}
                    disabled={integrityLoading || !senderResult || !receiverMessage.trim()}
                    className="btn btn-primary w-100"
                  >
                    {integrityLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify Integrity'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Integrity Results */}
            {integrityResult && (
              <div className="mt-4">
                {integrityResult.error ? (
                  <div className="alert alert-danger">{integrityResult.error}</div>
                ) : (
                  <div className={`alert ${integrityResult.integrityMaintained ? 'alert-success' : 'alert-danger'} border-2`}>
                    <div className="d-flex align-items-center mb-3">
                      {integrityResult.integrityMaintained ? (
                        <CheckCircle className="text-success me-2" size={28} />
                      ) : (
                        <AlertTriangle className="text-danger me-2" size={28} />
                      )}
                      <h4 className="mb-0 fw-bold">
                        {integrityResult.status}
                      </h4>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Original Hash:</strong>
                        <div className="bg-white p-2 rounded border mt-1" style={{fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all'}}>
                          {integrityResult.originalHash}
                        </div>
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Received Hash:</strong>
                        <div className={`p-2 rounded border mt-1 ${integrityResult.integrityMaintained ? 'bg-white' : 'bg-danger bg-opacity-10'}`} style={{fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all'}}>
                          {integrityResult.receivedHash}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="mb-0 fw-semibold">
                        {integrityResult.integrityMaintained 
                          ? '✅ The message has not been tampered with during transmission.'
                          : '❌ The message has been modified during transmission. Data integrity compromised!'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SHA256Demo;