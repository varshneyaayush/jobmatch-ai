"""
Comprehensive skills dictionary and taxonomies for tech, data, AI, cloud, design, and engineering roles.
"""

TECH_SKILLS_DATA = {
    # AI / ML / Data Science
    "Python": ["python", "py", "python3"],
    "Machine Learning": ["machine learning", "ml", "supervised learning", "unsupervised learning", "reinforcement learning"],
    "Deep Learning": ["deep learning", "dl", "neural networks", "ann", "cnn", "rnn", "transformer", "transformers"],
    "Natural Language Processing": ["nlp", "natural language processing", "text processing", "tokenization", "bert", "gpt", "llm", "llms"],
    "Computer Vision": ["computer vision", "cv", "opencv", "yolo", "object detection", "image classification"],
    "TensorFlow": ["tensorflow", "tf"],
    "PyTorch": ["pytorch", "torch"],
    "Scikit-learn": ["scikit-learn", "sklearn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Data Science": ["data science", "data scientist", "predictive modeling", "statistical modeling"],
    "Data Analysis": ["data analysis", "eda", "exploratory data analysis"],
    "Data Engineering": ["data engineering", "etl", "elt", "data pipeline", "data pipelines", "airflow"],
    "Generative AI": ["generative ai", "genai", "prompt engineering", "langchain", "llamaindex", "rag", "vector database", "chromadb", "pinecone"],
    "Hugging Face": ["hugging face", "huggingface", "transformers library"],
    "Keras": ["keras"],
    "OpenCV": ["opencv"],
    "Matplotlib": ["matplotlib"],
    "Seaborn": ["seaborn"],
    "Tableau": ["tableau"],
    "Power BI": ["power bi", "powerbi"],
    "Big Data": ["big data", "hadoop", "spark", "pyspark"],
    "Apache Spark": ["spark", "pyspark", "apache spark"],
    "Apache Kafka": ["kafka", "apache kafka", "event streaming"],
    "MLOps": ["mlops", "mlflow", "kubeflow", "model deployment", "wandb", "dvc"],

    # Web & Frontend
    "JavaScript": ["javascript", "js", "es6", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "React": ["react", "react.js", "reactjs"],
    "Next.js": ["next.js", "nextjs", "next"],
    "Vue.js": ["vue", "vue.js", "vuejs", "vue3"],
    "Angular": ["angular", "angularjs"],
    "HTML5": ["html", "html5"],
    "CSS3": ["css", "css3", "vanilla css"],
    "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind css"],
    "SASS/SCSS": ["sass", "scss"],
    "Redux": ["redux", "redux toolkit", "rtk"],
    "Zustand": ["zustand"],
    "Three.js": ["three.js", "threejs", "three", "webgl"],
    "GraphQL": ["graphql", "apollo client"],
    "Webpack": ["webpack", "vite"],
    "Vite": ["vite", "vitejs"],

    # Backend & Frameworks
    "Node.js": ["node.js", "nodejs", "node"],
    "Express.js": ["express", "express.js", "expressjs"],
    "NestJS": ["nestjs", "nest.js"],
    "FastAPI": ["fastapi", "fast api"],
    "Django": ["django", "django rest framework", "drf"],
    "Flask": ["flask"],
    "Java": ["java", "core java", "java 8", "java 17"],
    "Spring Boot": ["spring boot", "spring", "springboot", "spring mvc"],
    "C#": ["c#", "csharp", ".net", ".net core", "asp.net"],
    "C++": ["c++", "cpp"],
    "Go": ["go", "golang"],
    "Rust": ["rust"],
    "PHP": ["php", "laravel"],
    "Ruby": ["ruby", "ruby on rails", "rails"],
    "RESTful API": ["rest", "restful api", "rest api", "api development", "web services", "apis"],
    "gRPC": ["grpc", "protobuf"],
    "Microservices": ["microservices", "microservice architecture", "distributed systems"],
    "System Design": ["system design", "software architecture", "high availability", "scalability"],

    # Databases
    "SQL": ["sql", "rdbms", "relational database"],
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MySQL": ["mysql"],
    "SQLite": ["sqlite", "sqlite3"],
    "MongoDB": ["mongodb", "mongo", "nosql"],
    "Redis": ["redis", "in-memory caching"],
    "Cassandra": ["cassandra"],
    "DynamoDB": ["dynamodb"],
    "Elasticsearch": ["elasticsearch", "elastic search", "opensearch"],
    "Supabase": ["supabase"],
    "Firebase": ["firebase", "firestore"],

    # Cloud & DevOps
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks", "cloudformation", "iam"],
    "Google Cloud Platform": ["gcp", "google cloud", "google cloud platform", "bigquery", "cloud run", "gke"],
    "Microsoft Azure": ["azure", "microsoft azure", "azure devops", "azure functions"],
    "Docker": ["docker", "containerization", "docker compose"],
    "Kubernetes": ["kubernetes", "k8s", "helm"],
    "CI/CD": ["ci/cd", "continuous integration", "github actions", "gitlab ci", "jenkins", "circleci"],
    "Terraform": ["terraform", "iac", "infrastructure as code"],
    "Linux": ["linux", "bash", "shell scripting", "ubuntu", "centos", "unix"],
    "Git": ["git", "github", "gitlab", "bitbucket", "version control"],
    "Nginx": ["nginx", "reverse proxy"],

    # Product, Management & Methodologies
    "Agile": ["agile", "scrum", "kanban", "sprint planning"],
    "JIRA": ["jira", "confluence"],
    "Product Management": ["product management", "roadmapping", "user stories", "kpis"],
    "UI/UX Design": ["ui/ux", "ui design", "ux design", "user experience", "figma", "wireframing", "prototyping"],
    "Figma": ["figma"],
    "Unit Testing": ["unit testing", "pytest", "jest", "mocha", "junit", "tdd", "integration testing"],
    "Cybersecurity": ["cybersecurity", "information security", "owasp", "penetration testing", "oauth2", "jwt"],
}

ALL_SKILL_NAMES = list(TECH_SKILLS_DATA.keys())

def categorize_skill(skill_name: str) -> str:
    ai_skills = {"Python", "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Data Science", "Data Analysis", "Data Engineering", "Generative AI", "Hugging Face", "Keras", "OpenCV", "Matplotlib", "Seaborn", "Tableau", "Power BI", "Big Data", "Apache Spark", "Apache Kafka", "MLOps"}
    frontend_skills = {"JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "HTML5", "CSS3", "Tailwind CSS", "SASS/SCSS", "Redux", "Zustand", "Three.js", "GraphQL", "Webpack", "Vite", "UI/UX Design", "Figma"}
    backend_skills = {"Node.js", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Java", "Spring Boot", "C#", "C++", "Go", "Rust", "PHP", "Ruby", "RESTful API", "gRPC", "Microservices", "System Design"}
    cloud_skills = {"AWS", "Google Cloud Platform", "Microsoft Azure", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Git", "Nginx", "Cybersecurity"}
    db_skills = {"SQL", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Elasticsearch", "Supabase", "Firebase"}

    if skill_name in ai_skills:
        return "AI & Data"
    elif skill_name in frontend_skills:
        return "Frontend & Design"
    elif skill_name in backend_skills:
        return "Backend & Systems"
    elif skill_name in cloud_skills:
        return "Cloud & DevOps"
    elif skill_name in db_skills:
        return "Databases"
    return "General Tech"
