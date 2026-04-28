"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Upload, FileText, Calendar, DollarSign, AlertCircle,
  CheckCircle, X, Download, Eye, Trash2
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "completed" | "error";
}

export default function UploadSchemePanel() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [schemeName, setSchemeName] = useState("");
  const [schemeDescription, setSchemeDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    simulateUpload(newFiles);
  };

  const simulateUpload = (files: UploadedFile[]) => {
    setIsUploading(true);
    
    files.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: 100, status: "completed" } : f
            )
          );
          setIsUploading(false);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress } : f
            )
          );
        }
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    if (!schemeName || uploadedFiles.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Scheme uploaded successfully!");
    // Reset form
    setSchemeName("");
    setSchemeDescription("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setUploadedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 text-[#d8e3fb]">Upload New Scheme</h1>
          <p className="text-[#c2c6d6]">Create and upload new promotional schemes for your distributors</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scheme Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-[#152031] border-[#424754] text-[#d8e3fb]">
                <CardHeader>
                  <CardTitle className="text-[#d8e3fb]">Scheme Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schemeName" className="text-[#c2c6d6]">Scheme Name *</Label>
                    <Input
                      id="schemeName"
                      placeholder="Enter scheme name"
                      value={schemeName}
                      onChange={(e) => setSchemeName(e.target.value)}
                      className="bg-[#1f2a3c] border-[#424754] text-[#d8e3fb] placeholder:text-[#636b7a]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schemeDescription" className="text-[#c2c6d6]">Description</Label>
                    <Textarea
                      id="schemeDescription"
                      placeholder="Describe the scheme objectives and benefits"
                      value={schemeDescription}
                      onChange={(e) => setSchemeDescription(e.target.value)}
                      className="bg-[#1f2a3c] border-[#424754] text-[#d8e3fb] placeholder:text-[#636b7a] min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-[#c2c6d6]">Start Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c909f] h-4 w-4" />
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-[#1f2a3c] border-[#424754] text-[#d8e3fb] pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-[#c2c6d6]">End Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c909f] h-4 w-4" />
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-[#1f2a3c] border-[#424754] text-[#d8e3fb] pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-[#c2c6d6]">Budget Allocation</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c909f] h-4 w-4" />
                      <Input
                        id="budget"
                        type="text"
                        placeholder="Enter budget amount"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="bg-[#1f2a3c] border-[#424754] text-[#d8e3fb] placeholder:text-[#636b7a] pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* File Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-[#152031] border-[#424754] text-[#d8e3fb]">
                <CardHeader>
                  <CardTitle className="text-[#d8e3fb]">Scheme Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      isDragging
                        ? "border-[#adc6ff] bg-[#adc6ff]/10"
                        : "border-[#424754] bg-[#1f2a3c]/50 hover:border-[#8c909f]"
                    }`}
                  >
                    <Upload className="mx-auto h-12 w-12 text-[#adc6ff] mb-4" />
                    <p className="text-[#d8e3fb] font-medium mb-2">
                      Drag and drop files here
                    </p>
                    <p className="text-[#8c909f] text-sm mb-4">
                      or click to browse from your computer
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById("file-upload")?.click()}
                      variant="outline"
                      className="border-[#424754] text-[#d8e3fb] hover:bg-[#2a3548]"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Files
                    </Button>
                    <p className="text-[#636b7a] text-xs mt-4">
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
                    </p>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-[#c2c6d6]">Uploaded Files</h3>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {uploadedFiles.map((file) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-[#1f2a3c] border border-[#424754]"
                            >
                              <FileText className="h-8 w-8 text-[#adc6ff] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#d8e3fb] truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-[#8c909f]">
                                  {formatFileSize(file.size)}
                                </p>
                                {file.status === "uploading" && (
                                  <Progress value={file.progress} className="h-1 mt-2" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {file.status === "completed" && (
                                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                                )}
                                {file.status === "error" && (
                                  <AlertCircle className="h-5 w-5 text-red-400" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  className="text-[#8c909f] hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-[#152031] border-[#424754] text-[#d8e3fb]">
                <CardHeader>
                  <CardTitle className="text-[#d8e3fb]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#424754] text-[#d8e3fb] hover:bg-[#2a3548]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#424754] text-[#d8e3fb] hover:bg-[#2a3548]"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Scheme
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Scheme Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-[#152031] border-[#424754] text-[#d8e3fb]">
                <CardHeader>
                  <CardTitle className="text-[#d8e3fb]">Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#c2c6d6]">
                      Ensure all required fields are filled
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#c2c6d6]">
                      Upload clear and readable documents
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#c2c6d6]">
                      Set appropriate start and end dates
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#c2c6d6]">
                      Maximum file size: 10MB per file
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={isUploading || !schemeName || uploadedFiles.length === 0}
                className="w-full bg-[#adc6ff] text-[#002e6a] hover:bg-[#8c909f] font-medium"
              >
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#002e6a] border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Scheme
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}