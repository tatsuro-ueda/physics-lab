import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
README = ROOT / "README.md"
DEPLOY = ROOT / "scripts" / "deploy-physics-lab"
INSTALLER = ROOT / "scripts" / "install-deploy-helper.sh"


class DeployWorkflowTest(unittest.TestCase):
    def test_repo_has_deploy_scripts(self):
        self.assertTrue(DEPLOY.exists(), "deploy script is missing")
        self.assertTrue(INSTALLER.exists(), "installer script is missing")

        deploy = DEPLOY.read_text(encoding="utf-8")
        installer = INSTALLER.read_text(encoding="utf-8")

        self.assertIn("python3 build.py", deploy)
        self.assertIn("sudo -n /usr/local/bin/physics-lab-publish", deploy)
        self.assertIn("/srv/www/physics-lab/", deploy)
        self.assertIn("physics-lab-publish", installer)
        self.assertIn("/etc/sudoers.d/physics-lab-publish", installer)
        self.assertIn("/usr/local/bin/physics-lab-publish", installer)

    def test_readme_uses_deploy_script_workflow(self):
        readme = README.read_text(encoding="utf-8")

        self.assertIn("sudo ./scripts/install-deploy-helper.sh", readme)
        self.assertIn("./scripts/deploy-physics-lab", readme)
        self.assertNotIn("sudo cp ~/physics-lab/*.html /srv/www/physics-lab/", readme)


if __name__ == "__main__":
    unittest.main()
