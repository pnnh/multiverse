#include "server/process.h"
#include <spdlog/spdlog.h>

int main(int argc, char* argv[])
{
#ifndef NDEBUG
  spdlog::set_level(spdlog::level::info);
#endif
  spdlog::info("Server {}", "Started");

  constexpr int PORT = 7501;

  return server::runServer(PORT);
}