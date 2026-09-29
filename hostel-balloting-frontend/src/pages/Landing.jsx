import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Split text into words for animation
const splitWords = (text) => {
  return text.split(' ').map((word, i) => (
    <motion.span
      key={i}
      className="inline-block mr-[0.25em]"
      variants={{
        hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {word}
    </motion.span>
  ))
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  hover: {
    scale: 1.06,
    y: -4,
    transition: { duration: 0.25 },
  },
  tap: { scale: 0.96 },
}

function Landing() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with slow elegant zoom */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/unilorin-background.png')" }}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 14, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-blue-950/70" />
      </motion.div>

      {/* Header */}
      <motion.header
        className="absolute top-6 left-6 flex items-center gap-3 text-white z-10"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <img
          src="/unilorin-logo.png"
          alt="University of Ilorin logo"
          className="w-13 h-13 object-contain"
        />
        <div>
          <p className="font-semibold leading-tight">UNIVERSITY OF ILORIN</p>
          <p className="text-sm text-white/80 leading-tight">Hostel Balloting System</p>
        </div>
      </motion.header>

      {/* Login button */}
      <motion.div
        className="absolute top-6 right-6 z-10"
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
      >
        <Link
          to="/login"
          className="bg-white text-blue-950 font-medium px-5 py-2 rounded-full inline-block shadow-lg"
        >
          Login
        </Link>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center text-white px-4 max-w-3xl">
        {/* Title - word by word */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {splitWords('Welcome to UNILORIN')}
          <br />
          {splitWords('Hostel Balloting System')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/85 text-lg md:text-xl mb-10 leading-relaxed"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.9 }}
        >
          Your official portal for hostel applications,
          <br />
          ballot results and more.
        </motion.p>

        {/* Get Started button */}
        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          transition={{ delay: 1.1 }}
        >
          <Link
            to="/login"
            className="bg-white text-blue-950 font-semibold px-8 py-3.5 rounded-full inline-block shadow-xl"
          >
            Get Started →
          </Link>
        </motion.div>
      </div>

      {/* Footer text */}
      <motion.p
        className="absolute bottom-6 right-6 text-white/60 text-sm z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        ...Better By Far
      </motion.p>
    </div>
  )
}

export default Landing