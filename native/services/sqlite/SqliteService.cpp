
#include "SqliteService.h"
#include <sqlite3.h>

namespace sqlite = polaris::native::services::sqlite;
sqlite::SqliteService::SqliteService() : dbHandles()
{
}

sqlite::SqliteService::~SqliteService()
{
    for (auto& [handle, db] : dbHandles)
    {
        if (db == nullptr) continue;
        sqlite3_close(db);
    }
}

sqlite::SqliteHandle sqlite::SqliteService::openDatabase(const char* path)
{
    return openDatabase(std::string(path));
}

sqlite::SqliteHandle sqlite::SqliteService::openDatabase(std::string&& path)
{
    sqlite3* db;
    char* zErrMsg = nullptr;

    auto cPath = path.c_str();
    int rc = sqlite3_open(cPath, &db);
    if (rc) throw models::protocol::QuantumException("Can't open database", sqlite3_errmsg(db));

    const SqliteHandle handle = dbHandles.size();

    dbHandles[handle] = db;

    return handle;
}

polaris::native::models::protocol::QuantumError sqlite::SqliteService::closeDatabase(sqlite::SqliteHandle dbHandle)
{
    auto db = dbHandles[dbHandle];
    if (db == nullptr) throw models::protocol::QuantumException("Database handle not found");
    auto rc = sqlite3_close(db);
    if (rc) throw models::protocol::QuantumException("Can't close database", sqlite3_errmsg(db));
    return models::protocol::QuantumError::OK;
}

sqlite::SqliteResult sqlite::SqliteService::runSql(SqliteHandle dbHandle, std::string& text)
{
    return runSql(dbHandle, std::move(text));
}

std::string sqlite::SqliteService::sqliteVersion(SqliteHandle dbHandle)
{
    auto sqlResult = runSql(dbHandle, "SELECT sqlite_version() as version;");
    auto verColumn = sqlResult.getColumn(0, 0);
    if (!verColumn.has_value()) throw models::protocol::QuantumException("Can't get sqlite version");

    return verColumn.value().getStringValue();
}

sqlite::SqliteResult sqlite::SqliteService::runSql(SqliteHandle dbHandle,
                                                                   std::string&& sqlText)
{
    auto db = dbHandles[dbHandle];
    if (db == nullptr) throw models::protocol::QuantumException("Database handle not found");

    sqlite3_stmt* stmt;
    int row = 0;

    auto rc = sqlite3_prepare_v2(db, sqlText.c_str(), static_cast<int>(sqlText.length() + 1), &stmt, nullptr);
    if (rc) throw models::protocol::QuantumException("Can't prepare statement", sqlite3_errmsg(db));

    SqliteResult sqlResult;
    while (true)
    {
        int step = sqlite3_step(stmt);
        if (step == SQLITE_ROW)
        {
            SqliteRow sqlRow;
            // int bytes;
            // const unsigned char* text;
            auto count = sqlite3_column_count(stmt);
            for (int colIndex = 0; colIndex < count; ++colIndex)
            {
                //bytes = sqlite3_column_bytes(stmt, 0);
                auto colType = sqlite3_column_type(stmt, colIndex);
                auto colName = sqlite3_column_name(stmt, colIndex);

                // auto colNameString = std::string(reinterpret_cast<const char*>(colName));
                auto sqlColumn = SqliteColumn(colType, colIndex, colName);

                switch (colType)
                {
                case SQLITE_TEXT:
                    {
                        auto colText = sqlite3_column_text(stmt, colIndex);
                        auto colTextString = std::string(reinterpret_cast<const char*>(colText));
                        sqlColumn.setStringValue(std::move(colTextString));
                        break;
                    }
                case SQLITE_INTEGER:
                    {
                        sqlColumn.setIntValue(sqlite3_column_int(stmt, colIndex));
                        break;
                    }
                case SQLITE_FLOAT:
                    {
                        sqlColumn.setFloatValue(sqlite3_column_double(stmt, colIndex));
                        break;
                    }
                case SQLITE_NULL:
                    {
                        sqlColumn.setNull();
                        break;
                    }
                default: { break; }
                }

                sqlRow.appendColumn(std::move(sqlColumn));
            }
            sqlResult.appendRow(std::move(sqlRow));
            row++;
        }
        else if (step == SQLITE_DONE)
        {
            break;
        }
        else
        {
            throw models::protocol::QuantumException("Can't step statement", sqlite3_errmsg(db));
        }
    }
    return sqlResult;
}
