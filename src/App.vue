<template>
  <div id="app">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="ISBN-13">
        <el-input v-model="form.isbn"></el-input>
      </el-form-item>
      <el-form-item label="Title">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="(transcription)">
        <el-input v-model="form.titleTranscription"></el-input>
      </el-form-item>
      <el-form-item label="Volume">
        <el-input v-model="form.volume"></el-input>
      </el-form-item>
      <el-form-item label="Author">
        <el-input v-model="form.author"></el-input>
      </el-form-item>
      <el-form-item label="Series Title">
        <el-input v-model="form.seriesTitle"></el-input>
      </el-form-item>
      <el-form-item label="Publisher">
        <el-input v-model="form.publisher"></el-input>
      </el-form-item>
      <el-form-item label="Publish Date">
        <el-input v-model="form.pubDate"></el-input>
      </el-form-item>
      <el-form-item label="Comment">
        <el-input type="textarea" v-model="form.comment"></el-input>
      </el-form-item>
      <el-form-item label="Thumbnail Data">
        <input id="inputFile" type="file" accept="image/*" @change="handleFileSelect"/>
        <output id="outputList"></output>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">Submit</el-button>
        <el-button type="info" @click="queryData">Get Info</el-button>
        <el-button @click="clearForm">Clear</el-button>
      </el-form-item>
    </el-form>
    <div v-if="showImg">
      <canvas id="resizeCanvas" ref="resizeCanvas" :width="canvWidth" :height="canvHeight"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      form: {
        isbn: '',
        title: '',
        titleTranscription: '',
        volume: '',
        author: '',
        seriesTitle: '',
        publisher: '',
        pubDate: '',
        images: {
          smallThumbnail: {
            type: '',
            data: '',
          },
          thumbnail: {
            type: '',
            data: '',
          },
        },
        comment: '',
      },
      img: null,
      canvas: null, ctx: null,
      showImg: false,
      canvWidth: 0,
      canvHeight: 0,
    }
  },
  methods: {
    handleFileSelect(e) {
      if(e.target.files.length === 0) {
        return;
      }

      const vm = this;

      const file = e.target.files[0];
      const fileBlobUrl = window.URL.createObjectURL(file);
      console.log(fileBlobUrl);

      vm.showImg = true;

      vm.$nextTick(function(){
        vm.canvas = vm.$refs.resizeCanvas;
        vm.ctx = vm.canvas.getContext('2d');
        vm.img = document.createElement('img');

        vm.img.onload = function() {

          const resizeWidth = 160;
          const ratio = resizeWidth / vm.img.width;
          const resizeHeight = vm.img.height * ratio;

          vm.canvWidth = resizeWidth;
          vm.canvHeight = resizeHeight;

          vm.$nextTick(function() {
            vm.ctx.drawImage(vm.img, 0, 0, resizeWidth, resizeHeight);
          });

        };

        vm.img.src = fileBlobUrl;
      });

      // fileReader.readAsArrayBuffer(file);
      // fileReader.onload = () => {
      //   console.log(fileReader.result);
      // };
    },
    parseData(json) {
      this.form.title = json.title;
      this.form.titleTranscription = json.titleTranscription;
      this.form.volume = json.volume;
      this.form.author = json.author;
      this.form.seriesTitle = json.seriesTitle;
      this.form.publisher = json.publisher;
      this.form.pubDate = json.pubDate;
    },
    queryData() {
      if(this.form.isbn.length !== 13 && this.form.isbn.length !== 10) {
        this.$message.error('Error: Invalid ISBN value');
      }else{
        const xhr = new XMLHttpRequest();

        const queryUrl = '/api/books' + '/' + this.form.isbn;
        xhr.open('GET', queryUrl);
        xhr.responseType = 'json';

        xhr.onload = (e) => {
          this.parseData(xhr.response);
        };

        xhr.send(null);
      }
    },
    submitForm() {
      this.$message('なんかする予定');
    },
    clearForm() {
      this.form.isbn = '';
      this.form.title = '';
      this.form.titleTranscription = '';
      this.form.volume = '';
      this.form.author = '';
      this.form.seriesTitle = '';
      this.form.publisher = '';
      this.form.pubDate = '';
      this.form.images.thumbnail.type = '';
      this.form.images.thumbnail.data = '';
      this.form.images.smallThumbnail.type = '';
      this.form.images.smallThumbnail.data = '';
      this.form.comment = '';
      this.showImg = false;
    },
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
