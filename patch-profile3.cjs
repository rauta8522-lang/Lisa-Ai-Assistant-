const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

const planState = `  // State: Plan
  const [lisaPlan, setLisaPlan] = useState<"free" | "paid" | "loading">("loading");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLisaPlan("free");
          return;
        }
        const token = await user.getIdToken();
        const res = await fetch("/api/subscription/status", {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        const data = await res.json();
        setLisaPlan(data.plan === "paid" ? "paid" : "free");
      } catch (e) {
        setLisaPlan("free");
      }
    };
    fetchPlan();
  }, []);

`;

code = code.replace(
  '  // State: Privacy Settings',
  planState + '  // State: Privacy Settings'
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
console.log("Plan state added");
