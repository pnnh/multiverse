#include "notebook.h"

#include <string>
#include <filesystem>
#include "quantum/services/filesystem/filesystem.h"
#include "huable/starlight/services/yaml/yaml.h"
#include "quantum/utils/md5.h"
#include "quantum/types/String.h"

huable::starlight::NotebookServerBusiness::NotebookServerBusiness(const std::string& baseUrl)
{
    this->baseUrl = baseUrl;
}

std::shared_ptr<std::vector<huable::starlight::PSNotebookModel>>
huable::starlight::NotebookServerBusiness::selectNotebooks() const
{
    auto libraries = std::make_shared<std::vector<huable::starlight::PSNotebookModel>>();

    for (const auto& entry : std::filesystem::directory_iterator(this->baseUrl))
    {
        auto dirName = entry.path().filename();
        if (entry.path() == "." || entry.path() == ".." || !entry.is_directory())
        {
            continue;
        }

        auto filePath = dirName.string();
        if (!isNotebookDirectory(filePath))
        {
            continue;
        }
        auto notebookModel = huable::starlight::PSNotebookModel(filePath);
        auto metadataFilePath = quantum::JoinFilePath({this->baseUrl, filePath, "metadata.yaml"});
        if (quantum::IsFileExist(metadataFilePath))
        {
            auto yamlHandler = quantum::YamlHandler(metadataFilePath);
            notebookModel.URN = yamlHandler.getString("metadata.urn").value_or("");
            notebookModel.Title = yamlHandler.getString("metadata.title").value_or(filePath);
            notebookModel.Description = yamlHandler.getString("metadata.description").value_or("");
            notebookModel.Image = yamlHandler.getString("metadata.image").value_or("");
        }
        if (notebookModel.URN.empty())
        {
            notebookModel.URN = quantum::calcMd5(entry.path().string());
        }
        libraries->emplace_back(notebookModel);
    }

    return libraries;
}

bool huable::starlight::isNotebookDirectory(const std::string& directoryName)
{
    return quantum::PSString::EndsWith(directoryName, ".notebook");
}