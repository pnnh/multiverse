
#include "channel.h"
#include <string>
#include <dirent.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <iostream>
#include "native/models/protocol/Exception.h"
#include "native/services/sqlite/SqliteService.h"
#include "native/services/logger/logger.h"

namespace models = native::models;
namespace business = native::business;
namespace services = native::services;
namespace logger = native::services::logger;

business::articles::ChannelServerBusiness::ChannelServerBusiness(const std::string& baseUrl)
{
    this->baseUrl = baseUrl;
}

std::shared_ptr<std::vector<models::articles::PSChannelModel>>
business::articles::ChannelServerBusiness::selectChannels() const
{
    auto channels = std::make_shared<std::vector<models::articles::PSChannelModel>>();
    DIR* pDir;
    dirent* ptr;
    if (!((pDir = opendir(this->baseUrl.c_str()))))
    {
        logger::Logger::LogInfo("Folder doesn't Exist!");
        return channels;
    }
    while ((ptr = readdir(pDir)) != nullptr)
    {
        if (strcmp(ptr->d_name, ".") != 0 && strcmp(ptr->d_name, "..") != 0)
        {
            channels->emplace_back(ptr->d_name);
        }
    }
    closedir(pDir);


    return channels;
}