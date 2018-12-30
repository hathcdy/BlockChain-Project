App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../students.json', function(data) {
      var studentsRow = $('#studentsRow');
      var studentTemplate = $('#studentTemplate');

      for (i = 0; i < data.length; i++) {
        studentTemplate.find('.panel-title').text(data[i].name);
        studentTemplate.find('img').attr('src', "images/me.png");
        studentTemplate.find('.student-id').text(data[i].id).attr('data-id', data[i].addr);        
        studentTemplate.find('span' + '.checked_in').text("false").attr('class', 'checked_in ' + data[i].id.toString()); 
        studentTemplate.find('.btn-check-in').attr('data-id', data[i].id);
        
        studentsRow.append(studentTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    // 加载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
    $.getJSON('Attendence.json', function (data) {
      // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
      var AttendenceArtifact = data;
      App.contracts.Attendence = TruffleContract(AttendenceArtifact);

      // Set the provider for our contract
      App.contracts.Attendence.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markCheckedIn();
    });    

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-check-in', App.handleCheckIn);
  },

  markCheckedIn: function(students, account) {
    var attendenceInstance;

    App.contracts.Attendence.deployed().then(function (instance) {
      attendenceInstance = instance;

      // 调用合约的getStates(), 用call读取信息不用消耗gas
      return attendenceInstance.getStates.call();
    }).then(function(states) {
      var studentsRow = $('#studentsRow');
      var studentTemplate = $('#studentTemplate');
      for (i = 0; i < states.length; i++) {               
        if (states[i]) {          
          var findStr = '.' + (i+1).toString();
          // console.log(findStr);
          studentsRow.find(findStr).text("true");
          $('.panel-pet').eq(i).find('button').text('Checked in').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleCheckIn: function(event) {
    event.preventDefault();

    var studentId = parseInt($(event.target).data('id'));
    console.log(studentId);

    var attendenceInstance;

    // 获取用户账号
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[studentId];

      App.contracts.Attendence.deployed().then(function (instance) {
        attendenceInstance = instance;
        
        // 签到
        return attendenceInstance.check_in(studentId - 1, { from: account });
      }).then(function (result) {
        return App.markCheckedIn();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
