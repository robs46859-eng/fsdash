const { spawn } = require("node:child_process");

function runCommand(grunt, command, args, options = {}) {
  return function taskRunner() {
    const done = grunt.task.current.async();
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        done();
        return;
      }
      done(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });

    child.on("error", (error) => done(error));
  };
}

module.exports = function configureGrunt(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    env: {
      host: "127.0.0.1",
      port: "3000",
    },
  });

  grunt.registerTask("clean", "Remove the built dist output.", runCommand(grunt, "rm", ["-rf", "dist"]));
  grunt.registerTask("lint", "Run the TypeScript no-emit check.", runCommand(grunt, "npm", ["run", "lint"]));
  grunt.registerTask("build", "Build the Vite production bundle.", runCommand(grunt, "npm", ["run", "build"]));
  grunt.registerTask(
    "dev",
    "Start the dashboard dev server on 127.0.0.1.",
    runCommand(grunt, "npm", ["run", "dev"], {
      env: {
        ...process.env,
        HOST: grunt.config.get("env.host"),
        PORT: grunt.config.get("env.port"),
      },
    }),
  );

  grunt.registerTask("default", ["lint", "build"]);
};
