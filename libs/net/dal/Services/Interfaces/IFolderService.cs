using TNO.Entities;

namespace TNO.DAL.Services;

public interface IFolderService : IBaseService<Folder, int>
{
    IEnumerable<Folder> FindMyFolders(int userId);
    IEnumerable<Folder> FindAll();
    Folder? FindById(int id, bool includeContent = false);
    IEnumerable<FolderContent> GetContentInFolder(int folderId);
    void RemoveContentFromFolders(long contentId);
    IEnumerable<Folder> GetFoldersWithFilters();

    void AddContentToFolder(long contentId, int folderId, bool toBottom = true);

    /// <summary>
    /// Clean content from the folder based on the folder's configuration settings.
    /// </summary>
    /// <param name="id"></param>
    /// <exception cref="NoContentException"></exception>
    void CleanFolder(int id);
}
