import Mock from 'mockjs';

var project_structure_data = Mock.mock({
  'data': [
    {
      "id": 1,
      "name": "file1",
      "type": "file"
    },
    {
      "id": 2,
      "name": "dir1",
      "type": "dir",
      "children": [
        {
          "id": 3,
          "name": "file2",
          "type": "file"
        }
      ]
    }
  ] 
});

var file_data = 'here is the test info';

Mock.mock('http://test.com/api/users/testAccount/projects/app/files', project_structure_data.data);

Mock.mock('http://test.com/api/users/testAccount/projects/app/files/app/file1', file_data);

Mock.mock('http://test.com/api/users/testAccount/projects/app/files/app/dir1/file2', file_data);