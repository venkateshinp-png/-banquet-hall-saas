---
name: Software Requirements Setup
overview: Complete list of all software, tools, and dependencies required to run the Banquet Hall SaaS application, including installation instructions and verification steps.
todos: []
isProject: false
---

# Software Requirements for Banquet Hall Project

## Required Software

### 1. Java Development Kit (JDK) 17

**Purpose**: Required to run Spring Boot backend

**Download**: [https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)

- Or use OpenJDK: [https://adoptium.net/](https://adoptium.net/)

**Installation**:

1. Download JDK 17 installer for Windows
2. Run installer and follow prompts
3. Set JAVA_HOME environment variable:
  - Search "Environment Variables" in Windows
  - Add new system variable: `JAVA_HOME` = `C:\Program Files\Java\jdk-17`
  - Add to Path: `%JAVA_HOME%\bin`

**Verify**:

```bash
java -version
# Should show: java version "17.x.x"
```

### 2. Apache Maven 3.8+

**Purpose**: Build tool for Java backend

**Download**: [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)

**Installation**:

1. Download `apache-maven-3.x.x-bin.zip`
2. Extract to `C:\Program Files\Apache\maven`
3. Add to Path: `C:\Program Files\Apache\maven\bin`

**Verify**:

```bash
mvn -version
# Should show Maven version and Java version
```

### 3. Node.js 18+ (includes npm)

**Purpose**: Required to run React frontend

**Download**: [https://nodejs.org/](https://nodejs.org/)

- Choose LTS (Long Term Support) version

**Installation**:

1. Download Windows installer (.msi)
2. Run installer (includes npm automatically)
3. Follow installation wizard

**Verify**:

```bash
node -v
# Should show: v18.x.x or higher

npm -v
# Should show: 9.x.x or higher
```

### 4. Git

**Purpose**: Version control (for GitHub upload)

**Download**: [https://git-scm.com/download/win](https://git-scm.com/download/win)

**Installation**:

1. Download Git for Windows
2. Run installer
3. Use default settings (Git Bash + Git GUI)

**Verify**:

```bash
git --version
# Should show: git version 2.x.x
```

## Optional but Recommended Software

### 5. Visual Studio Code (IDE)

**Purpose**: Code editor for frontend and backend

**Download**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

**Recommended Extensions**:

- Extension Pack for Java
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

### 6. IntelliJ IDEA Community Edition (Alternative IDE)

**Purpose**: Java-focused IDE for backend development

**Download**: [https://www.jetbrains.com/idea/download/](https://www.jetbrains.com/idea/download/)

### 7. Postman or Thunder Client

**Purpose**: API testing

**Download**: 

- Postman: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
- Thunder Client: VS Code extension

### 8. Docker Desktop (Optional)

**Purpose**: If you want to use PostgreSQL instead of H2

**Download**: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

**Note**: Currently the project uses H2 (embedded database), so Docker is not required.

## Current Project Setup

Based on your project at `d:\ban`, you're using:

- **Backend**: Spring Boot 3.2.5 + Java 17 + H2 Database
- **Frontend**: React 18 + Vite 5 + TypeScript + Tailwind CSS

## Installation Verification Checklist

After installing all required software, verify everything works:

```bash
# Check Java
java -version

# Check Maven
mvn -version

# Check Node.js
node -v

# Check npm
npm -v

# Check Git
git --version
```

## Project Setup After Software Installation

### Backend Setup:

```bash
cd d:\ban\backend
mvn clean install
mvn spring-boot:run
```

Backend will start at: [http://localhost:8080](http://localhost:8080)

### Frontend Setup:

```bash
cd d:\ban\frontend
npm install
npm run dev
```

Frontend will start at: [http://localhost:5173](http://localhost:5173) or 5174

## System Requirements

**Minimum**:

- Windows 10/11
- 8 GB RAM
- 10 GB free disk space
- Internet connection (for downloading dependencies)

**Recommended**:

- Windows 11
- 16 GB RAM
- SSD with 20 GB free space
- Stable internet connection

## Troubleshooting Common Issues

### Maven not found:

- Ensure Maven bin folder is in PATH
- Restart terminal after setting environment variables

### npm install fails:

- Run as Administrator
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and try again

### Java version mismatch:

- Check JAVA_HOME points to JDK 17
- Ensure no other Java versions are in PATH before JDK 17

### Port already in use:

- Backend (8080): Kill process using `netstat -ano | findstr :8080` then `taskkill /F /PID [PID]`
- Frontend (5173/5174): Same process for respective port

## Already Installed (Confirmed)

Based on our previous work, you already have:

- Java 17 ✓
- Maven ✓
- Node.js ✓
- npm ✓
- Git ✓

All software is already working on your system!