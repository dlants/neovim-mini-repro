vim.opt.runtimepath:append(".")
vim.notify("test: init", vim.log.levels.INFO)

-- local __filename = debug.getinfo(1, "S").source:sub(2)
-- local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"
local plugin_root = "./"

local log_exit = function()
  return function(job_id, exit_code)
    vim.print("++++++++++++++++")
    vim.print("job# " .. job_id .. ":")
    vim.print("exit_code: " .. exit_code)
  end
end

local log_job = function(is_stderr)
  local lines = {""}
  return function(job_id, data)
    local eof = #data > 0 and data[#data] == ""
    lines[#lines] = lines[#lines] .. data[1]
    for i = 2, #data do
      table.insert(lines, data[i])
    end
    if eof then
      local prefix = is_stderr and "[ERROR]" or "[INFO]"
      vim.print("----------------")
      vim.print(string.format("%s job# %d:", prefix, job_id))
      for _, line in ipairs(lines) do
        vim.print(line)
      end
      lines = {""}
    end
  end
end

local env = {
  IS_DEV = false,
  LOG_LEVEL = "debug"
}

-- local job_id =
--   vim.fn.jobstart(
--   "bun index.ts",
--   {
--     cwd = plugin_root,
--     stdin = "null",
--     on_exit = log_exit(),
--     on_stdout = log_job(false),
--     on_stderr = log_job(true),
--     env = env
--   }
-- )

local job_id =
  vim.fn.jobstart(
  "./venv/bin/python script.py",
  {
    cwd = plugin_root,
    stdin = "null",
    on_exit = log_exit(),
    on_stdout = log_job(false),
    on_stderr = log_job(true),
    env = env
  }
)

if job_id <= 0 then
  vim.api.nvim_err_writeln("Failed to start test server. Error code: " .. job_id)
  return
end
