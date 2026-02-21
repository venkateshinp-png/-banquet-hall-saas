# Use the project's bundled JDK 17

PowerShell (Windows):

```powershell
cd backend
.\set-java17.ps1
# Now JAVA_HOME is set for this session
.\.maven\apache-maven-3.9.5\bin\mvn.cmd -DskipTests package
```

Bash / WSL:

```bash
cd backend
source ./set-java17.sh
# Now JAVA_HOME is set for this shell
.\.maven/apache-maven-3.9.5/bin/mvn -DskipTests package
```

Notes:
- These scripts set `JAVA_HOME` only for the current shell/session.
- To change system-wide Java you must update Windows environment variables (requires admin).
