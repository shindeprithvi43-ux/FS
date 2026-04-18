import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    experienceLevel: 'Beginner',
    preferredTiming: 'Morning (6:00 AM - 9:00 AM)',
    guardianName: '',
    guardianContact: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed')
      return
    }
    setFiles(selectedFiles)
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.dob) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('email', formData.email)
      data.append('password', formData.password)
      data.append('phone', formData.phone)
      data.append('dob', formData.dob)
      data.append('experienceLevel', formData.experienceLevel)
      data.append('preferredTiming', formData.preferredTiming)
      data.append('guardianName', formData.guardianName)
      data.append('guardianContact', formData.guardianContact)

      files.forEach(file => {
        data.append('documents', file)
      })

      const result = await register(data)
      if (result.success) {
        toast.success('Registration successful! Your admission is pending approval.')
        setTimeout(() => navigate('/user/dashboard'), 1500)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side: Cinematic Background */}
        <div
          className="relative hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-24 bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRB2Rqtu6RmxJls2Eps1HtRrKfvJqAj5-P5c8sVzDXNcbrl1fQBtFbuIMAscwX5-vAW9P3DS_AKrR14VMhaGRGCPH9R_1KQTVat3K6MygufLXWGNumxfiFM0CYxSK2jNQpldNS44uoJBw9getZASeplnvPDvBZAuy-1BmkHKBp55i9ytR_n6YknPYAPrrticbIJ6HUAZ8RviOud7pP-ePBmudAuZe4Ab-aCEKIGcXAFmClq8F5Op0w6nXgpMJG_aLx12RPWx0dwxkW')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-accent rounded-lg text-primary">
                <span className="material-symbols-outlined text-3xl font-bold">sports_cricket</span>
              </div>
              <span className="font-stats text-2xl uppercase tracking-wider text-white">Krishna Cricket Academy</span>
            </div>
            <h1 className="font-stats text-6xl xl:text-8xl font-bold text-white leading-tight uppercase">
              Elevate <br /> <span className="text-accent">Your Game</span>
            </h1>
            <p className="mt-6 text-xl text-slate-200 max-w-lg leading-relaxed">
              Join the Elite at Krishna Cricket Academy. Start your journey to professional cricket today with world-class coaching.
            </p>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                <img className="h-12 w-12 rounded-full border-2 border-primary object-cover" alt="Academy student" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnxrcvnOLl8ofA79GLQ5MeK15jGOlyV3plHDVKcDGN6RdmhluS89WaiEoyDaIi8d5GvjqzVIFUGmVyIG5P5seduFN-Y4KuozUNvwwekU6hcD7SAe6y5rLUzAglvv1OuWmeU-o1brNonXM1UaLQyOkRBUsapgmNtolw_t7jHSi79C8nmkcSI_DppzKryLFW7IWjTu-QYhK2UqJCISyFRSAjvkrUK8wlEaQaorjkjYv79__CKAIVdgpMxGZsGGpinz07gmwUFaE7lwMp" />
                <img className="h-12 w-12 rounded-full border-2 border-primary object-cover" alt="Academy student" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWMixz-wZekeUaztg1ixat9qP2wtyV4xVqIwHuHWfoVl-XAkUQZ79NAvcMWbWPIV2J_thufRqUzUTYckG6hdKe3KiFVAy8N0cWNY9n12VRophiy0MHJsniVEjuma4TA7eKXqMmysMpP-opr2ZvFOMZSFwBIlEqIuZm8elMvUxAdrkwpFNhlrM34xdgyPDhbp89_3wppSeVFNE9Ztu7kmoIv6oLba3uYmX4jOhKgXiBihp4q1ytEsP8i7BdUWdukbN5615ELWBVG2tb" />
                <img className="h-12 w-12 rounded-full border-2 border-primary object-cover" alt="Academy student" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASWk-prclsLUREhDqGZFg70RTcsJjDeXEGVfzV63F8maFKgySiHUmXEsAVdU0ks37DwvMSdDCGTIg_N23CRL0HZMXx_YAt6fkyygTwis3ZlVVx4Si4CeP9ucD08Hu8NGGElg7FqNa-supDlMxpd6CUHk2BaImE24QHcmw8HXPfa21JL7TyAE7IDqr3z_bW9gNgKEcXc2qB9Mxy2JKvRsxXU5AO__tf0G29oGXF4388jU_9DnJMFtZubEeC-ToJ_ickaaHanS48PhIA" />
              </div>
              <span className="text-sm text-slate-300 font-medium">Join 500+ aspiring cricketers</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign-Up Form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 xl:px-24 bg-background-light dark:bg-background-dark overflow-y-auto">
          <div className="mx-auto w-full max-w-md lg:max-w-xl">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="p-2 bg-primary rounded-lg text-white">
                <span className="material-symbols-outlined">sports_cricket</span>
              </div>
              <span className="font-stats text-xl uppercase tracking-wider text-primary dark:text-accent">
                Krishna Cricket Academy
              </span>
            </div>

            <div className="mb-10">
              <h2 className="font-stats text-3xl font-bold tracking-tight text-primary dark:text-slate-100 uppercase">
                Player Registration
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Fill in your details to apply for admission to the academy.
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Section: Account Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                  <span className="material-symbols-outlined text-primary dark:text-accent">lock</span>
                  <h3 className="font-stats text-lg font-bold text-primary dark:text-slate-200 uppercase tracking-wide">
                    Account Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="email" name="email" placeholder="your@email.com" type="email"
                      value={formData.email} onChange={handleChange} required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="password" name="password" placeholder="Min 6 characters" type="password"
                      value={formData.password} onChange={handleChange} required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="confirmPassword" name="confirmPassword" placeholder="Re-enter password" type="password"
                      value={formData.confirmPassword} onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Student Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                  <span className="material-symbols-outlined text-primary dark:text-accent">person</span>
                  <h3 className="font-stats text-lg font-bold text-primary dark:text-slate-200 uppercase tracking-wide">
                    Student Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="name" name="name" placeholder="e.g. Rahul Sharma" type="text"
                      value={formData.name} onChange={handleChange} required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="dob">
                      Date of Birth <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="dob" name="dob" type="date"
                      value={formData.dob} onChange={handleChange} required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phone">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="phone" name="phone" placeholder="+91 00000 00000" type="tel"
                      value={formData.phone} onChange={handleChange} required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="experienceLevel">
                      Experience Level
                    </label>
                    <select
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="experienceLevel" name="experienceLevel"
                      value={formData.experienceLevel} onChange={handleChange}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="preferredTiming">
                      Preferred Timing
                    </label>
                    <select
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="preferredTiming" name="preferredTiming"
                      value={formData.preferredTiming} onChange={handleChange}
                    >
                      <option>Morning (6:00 AM - 9:00 AM)</option>
                      <option>Afternoon (3:00 PM - 6:00 PM)</option>
                      <option>Evening (6:00 PM - 9:00 PM)</option>
                      <option>Weekend Special</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Guardian Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                  <span className="material-symbols-outlined text-primary dark:text-accent">family_restroom</span>
                  <h3 className="font-stats text-lg font-bold text-primary dark:text-slate-200 uppercase tracking-wide">
                    Guardian Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="guardianName">
                      Guardian's Full Name
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="guardianName" name="guardianName" placeholder="Enter guardian name" type="text"
                      value={formData.guardianName} onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="guardianContact">
                      Guardian Contact Number
                    </label>
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-12 px-4 outline-none"
                      id="guardianContact" name="guardianContact" placeholder="Emergency contact" type="tel"
                      value={formData.guardianContact} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Document Upload */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                  <span className="material-symbols-outlined text-primary dark:text-accent">upload_file</span>
                  <h3 className="font-stats text-lg font-bold text-primary dark:text-slate-200 uppercase tracking-wide">
                    Documents (Optional)
                  </h3>
                </div>
                <div>
                  <label
                    htmlFor="documents"
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-white/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-4xl mb-2">cloud_upload</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Click to upload documents
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      JPG, PNG, PDF, DOC (Max 5MB each, up to 5 files)
                    </p>
                    <input
                      id="documents" name="documents" type="file"
                      multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-primary dark:text-accent text-lg">description</span>
                            <div className="min-w-0">
                              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{file.name}</p>
                              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-500 transition-colors ml-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-primary px-3 py-4 text-sm font-bold font-stats uppercase tracking-widest text-white hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Register Now'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-primary dark:text-accent hover:underline decoration-2 underline-offset-4"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-xs text-slate-400 dark:text-slate-500">
            <div className="flex justify-center gap-6 mb-4">
              <a className="hover:text-primary dark:hover:text-accent cursor-pointer">Terms of Service</a>
              <a className="hover:text-primary dark:hover:text-accent cursor-pointer">Privacy Policy</a>
              <a className="hover:text-primary dark:hover:text-accent cursor-pointer">Help Center</a>
            </div>
            <p>© 2024 Krishna Cricket Academy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
