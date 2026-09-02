import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Award, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { 
  fetchCertificateEligibility, 
  fetchCertificateByEnrollment,
  selectEligibilityFor,
  selectCertificateForEnrollment,
  selectCertificateLoading,
  selectEligibilityLoading 
} from '../../features/certificates/certificateSlice';
import { downloadCertificateUrl } from '../../api/certificateApi';

export default function CertificatePage() {
  const { enrollmentId } = useParams();
  const dispatch = useDispatch();

  const eligibility = useSelector(selectEligibilityFor(enrollmentId));
  const certificate = useSelector(selectCertificateForEnrollment(enrollmentId));
  const loading = useSelector(selectCertificateLoading);
  const eligibilityLoading = useSelector(selectEligibilityLoading);

  useEffect(() => {
    if (enrollmentId) {
      dispatch(fetchCertificateEligibility(enrollmentId));
      dispatch(fetchCertificateByEnrollment(enrollmentId));
    }
  }, [dispatch, enrollmentId]);

  if (loading || eligibilityLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-mono text-xs">
        <Loader2 className="animate-spin mr-2 text-emerald-500" size={16} /> Verifying certificate credentials...
      </div>
    );
  }

  const isEligible = eligibility?.eligible;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            Course Completion &amp; Credentials
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-slate-900 dark:text-white" style={{ fontFamily: "Fraunces, serif" }}>
            My Course Certificate
          </h1>
        </div>
      </div>

      {/* Eligibility Breakdown Card */}
      {eligibility && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300">
            Eligibility Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${eligibility.courseProgress.requirementMet ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
              <div>
                <p className="font-bold">Course Completion</p>
                <p className="text-[11px] opacity-80">{eligibility.courseProgress.completionPercentage}% / 80% required</p>
              </div>
              {eligibility.courseProgress.requirementMet ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${eligibility.assessments.requirementMet ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
              <div>
                <p className="font-bold">Required Assessments</p>
                <p className="text-[11px] opacity-80">{eligibility.assessments.passed} Passed</p>
              </div>
              {eligibility.assessments.requirementMet ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Display or Notice */}
      {certificate ? (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-emerald-500/30 text-white shadow-2xl flex flex-col items-center text-center space-y-4">
          <Award size={48} className="text-emerald-400 animate-bounce" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-fraunces">Certificate Awarded</h2>
            <p className="text-xs font-mono text-slate-300">Certificate No: <span className="text-emerald-400">{certificate.certificateNo}</span></p>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Congratulations {certificate.studentName}! You have successfully completed <span className="text-white font-semibold">{certificate.courseName}</span>.
          </p>
          <a
            href={downloadCertificateUrl(certificate.certificateNo)}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} /> Download Certificate PDF
          </a>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md">
          <Award size={36} className="mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Certificate Not Yet Available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {isEligible ? "Your certificate is being automatically generated by the engine. Please refresh in a moment." : "Meet all course completion and assessment requirements above to unlock your certificate."}
          </p>
        </div>
      )}
    </div>
  );
}