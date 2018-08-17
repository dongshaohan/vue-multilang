<template>
    <div id="app">
        <p class="tip">当前语言： <span class="em">{{lang}}</span></p>
        <p class="content">{{langObj['in-type1-ans3']}}</p>
    </div>
</template>

<script>
    export default {
        name: 'app',
        data() {
            return {
                langObj: {},
                lang: ''
            }
        },
        computed: {
            text() {
                /**
                 * {'rank': 'my name is %s'} from langObj
                 */
                // result: 'my name is dongshaohan'
                return this.$lang.template('rank', ['dongshaohan']);
            }
        },
        created() {
            this.$lang.onReady(() => {
                console.log('语言包加载完毕');
                console.log('langCode', this.$lang.langCode);
                console.log(this.$lang.template('vote-14', [100, 200]));
                this.langObj = this.$lang.langObj;
                this.lang = this.$lang.langCode;
            });
        }
    }
</script>

<style scoped>
    #app {
        font-family: "Microsoft YaHei", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
    .tip {
        font-size: 28px;
    }
    .em {
        color: #DD116B;
    }
    .content {
        padding: 0 50px;
        font-size: 20px;
    }
</style>
