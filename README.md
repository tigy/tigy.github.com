# J+ UI Library 概述      [in English](README-en.md)

J+ UI Library 是一个Javascript 用户界面组件库。它提供了：

* 一套可直接使用的 UI 组件。
* 一套用于二次开发的底层组件。
* 一个面向对象的 Javascript 底层开发框架。
* 一套组件开发的思路、规划、构架和工具。

### 直接使用组件

和传统的UI库一样， 所有组件都能直接在项目中使用。用户可以自定义组件，只引用所需要的组件。J+ 的主要特性有：
	
* 轻量，但功能丰富，核心部分普通压缩后为20K。
* 虽然类库自带底层，但也可以使用 jQuery 作为底层支持。
* 所有UI组件都是轻量级的封装，更符合前端开发人员的习惯，也方便自定义样式。
* 作为国产类库，对国内的特有需求提供支持。如城市选择器、解决中文乱码问题。
* 使用HTML5，但对低版本浏览器有降级处理，部分支持移动平台。

J+ 自带两套组件库，一套更适用于互联网级的网页开发，一套更适用于企业级应用开发。用户可以类似地开发出第三套更适合自己需求的组件库。

### 组件二次开发

成熟的大公司都有自己的组件库。构建组件库是一个费时费力的过程， 所以很多公司为了节约成本，砍掉了组件库。而其实一个优秀的组件库可以大大节约项目的时间。目前UI库很多，但没有一个库可以真正满足一个公司的全部需求。因此公司需要对UI库进行二次开发。但大部分UI库都有这样的特点：使用它提供的组件很方便，但想要自定义或新增一些组件却非常困难。

J+本身就是为了二次开发而做的，用户可以轻松地以J+为基础，完善属于自己的组件库。这主要体现于：

* 组件构架透明。添加组件非常方便，并且可以完美地融入组件库。
* 在代码上完全**面向对象**，方便修改和扩展。
* 统一规范。让不同的组件之间可以协同工作。

### 如何开始

##### 直接使用

从此处下载最新版本： [https://github.com/jplusui/release](https://github.com/jplusui/release)

##### 二次开发

git fork [https://github.com/jplusui/jplus-milk](https://github.com/jplusui/jplus-milk)

-----

# What’s jplus UI
JPlus UI is a flexible, Object-Oriented javascript user interface library, which include:
1.	A compact, Object-Oriented javascript base support
2.	A base UI framework which can re-develop independently
3.	A full set of powerful user interface widgets

# Why jplus UI

## Which jquery can, we can
1.	fully traversing, event handling, animating, and Ajax interactions support.
2.	Friendly, commonly API support.
3. Cross-broswer support, fully tested with  Safari, Internet Explorer 6+, Firefox, Opera, and Chrome.


## which jquery can’t, we can.
1.The base core is as low as 4k with gzip
2.all UI controls with lightweight package.
3. Object-Oriented based design which makes widgets easily extend, inheritance.
That’s best for the complex web applications.
*4.the base UI framework can import third framework for base support, even jquery
5. Performance advantages, see speed match




