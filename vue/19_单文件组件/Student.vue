<template>
<!-- 组件结构 -->
    <div class="demo">
        <h2>{{studentName}}</h2>
        <h2>{{studentAge}}</h2>
        <button @click="showName">点我提示学生名</button>
    </div>
</template>

<script>
//组件交互相关代码(数据、方法等等)
const student = Vue.extend({
    name:'student',
    data(){
        return{
            studentName:'张三',
            studentAge:'19'
        }
    },
    methods: {
        showName(){
            alert(this.studentName);
        }
    },
})
export default student
</script>

<style>
/*组件的样式*/
.demo{
    background-color: aquamarine;
}
</style>
