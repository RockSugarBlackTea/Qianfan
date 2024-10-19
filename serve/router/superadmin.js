const router = require('express').Router();
const db = require('../db/index.js');
const bcrypt = require('bcrypt');

// 定义盐的轮次，用于加密
const saltRounds = 10;
const tokensaltRounds = 10;

const defaultAvater = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAuIwAALiMBeKU/dgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAACAASURBVHic7N13mFTV+cDx77nTdmZ22b70qqBIs6Ao2LvRJMaaaIwdYRGjidGoiRK7pliQRTGx5BeNsSZqihUrNgR2lya91y2wbWan3PP7YyyULTP33pk75Xyeh+dRdu45Lzsz972ng6IoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqJYQdgdgKLYau5EHy7XESAPR2MYkmFIeiPoAeR//aoWYAewBcRShL4cHJ+Q3/Ipg58K2he8othLJRAl9yy6vATdfR6S80EbD9JtsKQg8DFSPIfuepGDHtxhZZiKku5UAlFyx8KpY9CjN4I420TS6Ew7Uj4P8n7GPLrQ4rIVJS2pBKJkv9rK4Uh+D3yP5H/mJfAquriBA2csS3JdimIrlUCU7FV9vR/apiH4OeBKbeUiBDxAKHw7Y2e1pbZuRUkNlUCU7LRgygg0+Rww0uZIluLgJ4yoWmBzHIpiOc3uABTFcjWVV6LJL7E/eQDsT5RPqJl8qd2BKIrVVAJRskvN5BuBWYDH7lB2kQfiCWqm3ItUrX4le6gPs5I9aiqnA1fbHUbXxHRGz7jG7igUxQqqBaJkh+opd5P2yQNATqWm8na7o1AUK6gWiJL5qisrEcywO4wETWJ01WN2B6EoZqgEonRvyZRSwhyJ0A9AakNB7gP4geKvXxH4+s8GhFyOFMuR+ieM7rUYMU1PamzVU8Yh+CAJCwOTrR2NoxhZ9UXSa6qdug8yMg7E/sC+SHrtslVLGGhFyB1IbS1CLkOKJYTCHzN21s6kx6ZkNJVAlI4tmDICjYtAPxXEKAx1d4oGhD4btOdpdr/G+AcClsY4d2IhblcNyAGWlpsqkrX4HKMZOr3J0nLnTnThcZwM4jwkJwJ9DJQSBRYg+B9a9FlGPLbY0hiVrKASiPKdRee60csvQjIFOMji0luQ/A09+icOemy5JSXWTq5CismWlGUbMYPRM6wZu6mt7A9yKlK7HGSJJWV+Zx6CKrTt/8eIF0IWl61kKJVAlFjiiJZPAX4J9E1ybTrwMg5uYkTVCsOl1Ew5AuRHJGEiiEvAQIdGkQMEgsaoZG1UJyytrgkAHSknMGbmp4ZLqJ7aD6HfCfICkr/ifgOSPxCOVDF2VjjJdSlpTiWQXFcz+UQQ04H9U1uxCCHlw+Cbxpg/tCZ8eU3l+8DRVkWzr1PjggIXp3udHOjRcIvdvxohKVnQrvPvQIRnm8OsiFg6tPM+o6uOTfiq5VM9BKO/RnID4LMyoO6JxWjyakZWzU5tvUo6UQkkV825zktB8GGkuMLmSJah8dOEBpMXVh6HzrtWVD7EpXFPSR7n+J1xN2V04KXWMDfVB1kZsahZIsWJjJnxTtyvr540EiH+BmKMNQEYJHmUHm3XqXNRcpNaB5KLaq7en/z2z9MgeQAMQ+djaqfEv7hO5yYrKr620M3Cvvmcl0DygNiX5ly/i9p+BVxbaNHkLyHj/zfVVF6C0L6wPXkACCbR5PuE+VcNtTsUJfVUCyTXLJh0GA7t30jK7A6lA49TX1HJcdMinb5i/qRBOLSVmHj4cQj4S1keFxdYc/P/a3OYy+oCRM01RiQOhnU5LiQR1FTehuA2UzUlhWhAyO8zqmqO3ZEoqaNaILmkZvJpaNrsNE0eAFdSsu1vPH+uo9NXOLTLMPG5FcCT5V7LkgfAzwpcPFXuNfs0JoiIyzr9qURQO+XR9EweALIEyRuxMTUlV6gEkiuqJx8O4gVSPtiaIMH5DC9/Ajmtk8+mONtM8dcXubko3/qJSj/Nd/GrIpP7Nwp5Vqc/q6m8H+REcxUkXT6If7Hw6gl2B6KkhurCygXVk0YitA+BIrtDiZuQdzNq5i27/V311H6I6HqjRY5wa8zvm48rSZ/6iISDN7ZQGzIxQ8vB0L26sWoqfw3cYy66FBLUocsjGTPzK7tDUZJLtUCy3dLLChDaS2RS8gCQ4iZqJp+529+JqKnukQdKvUlLHgBOAX8qzTNXSFSestv/11aeDNxprtAUk5QhxIvMnZjerV3FNJVAsl0obyYwzO4wDBAgnmbxlIG7/NXBRgs7yOPgJG/nQytWOdHrZKzHzNdKO+Tb/1xU2QvJs0DyA7feSFzOh+0OQkkulUCyWe2UHwEX2h2GCT2IyJnf/p+Uhk8YvNLCQfPuXG6qLvnd1FxdPgKUmg7ILoLLqZ18ut1hKMmjEki2qr7ej+TBZBXvFNDLIejnFBRqSR1KO43qyp8AIBhutJDTfYk9xEekxtZ2H1vbfURkYl+T033OhF6/hwNi03Wn/BBpbsJAVwo1QX+nRi+HwJnMt0+KB1l9icl+PSVdqUH0bFVbeRuSaVYV5xJwitfJWX4nh+c52c+l7fb00aBLqkNR3miL8nxrmNVhS7f6WIPXsT+BaAuQ8N25n1OwfkBBl69pjrj5x8b9eWv7QOY09mVDYPfX9/M2M6F4IyeWr+X8vkspcHa9n+CAdS2sN7rdSShSjtv5ARhPmHsa4tI4z+/kFJ+LMW6N4l2Svg58Fdb5NBjhpdYIbwYiVu/7dROjq+61tEQlLagEko2WT+1BILqG787rMMwlYHKBm+uL3PR3xvckHpXwaluEmxuCLLUukdwI3GfkwhO8Tt7u3fF4bmM4j999NZ6/rB1NSzS+6b35jjBXDKzh1v3mUOzqeAePkza38Xag8/WQXRLybqS42djFuxv+9VYt309gtf36iM79O0I82hzCop1a6nEwiBFVLZaUpqQN1YWVjQKRyViQPMa4Nb7om89DZXlxJw+IrfT+kd9JTb98phV7cFjzmHJL9y/pWEknXWwvbR7G0Heu4KFVh8SdPABaoi4eXHUIQ9+5gpc3d7yDR4mZb5YUvzRxNRB7D6YVe6jul88PE9yqpb9TY3pZHl/09TPKbcktohSdq6woSEkvKoFkG4kAYXrB2Zl+Fx/3yWeMiRuIS8BtxR7+3dOP3/wnrYeZOPZ0y9KjOPeLH1Af8hoOqD7k5Zwvfshvlh6118+cwlTWNLUiMV8I/tvLz23FHlPTlg90O5jT188P/BYsvJRMin02lWyiEki2qZl0HDDETBE/8Lt4ocJrxU0fgFN8Dv7Ty4/Xpk9bg757P8yNi4/m7mWHW3I/kwjuWnY4v116ZJd1popXg//29lk2ZTlfCF6s8PJ9v6mJAQD7sujq8VbEpKQPlUCyjnaBmatHuh08V+61fGbO0XkOZppdZGfQ2l3GYf6w5gDuXzHO8jruXHYE09ce8O3/r0vS6VPdmVXm5cg8a5eNuAQ8V+5lhNnuLKmb+mwq6UclkGwjONnopS4Bz1V4k9ZSuLjAzTlWdIck6Kuwzk5dsqC1BzcuSt5ef9ctPIFFrT1okpKl4WjS6unM+X4XP03CPl8APk3wbIXJBwvJaZYFpKQFlUCySc3V+wP9jV4+qcBt/imzGw+U5pFnbnwgYTrwZiDCeTXj0aMmNzzsQjSax9m1R/BWWwRLJzHHIU8I/liavH8bwGi3g6vMLcgcTO3UfayKR7GfSiBZJXqE0SudAm4sSv5q7X5OwUUFqW+F3LUtj+XbRyS9nq+2jeSu7anvqru4wEnfBGbKGXVjkdvkrDpdjYNkEZVAsopmeKuP032puQEBXGlDAqmWO8HdmPyK3DuYr+9Mfj17SNVWLf2dGqd5TQyoS5KfxZWUMT21QkkjQh+BNPZ4eLqBm0JId/DmtkG8X9+f2uYy1gd6ENQdeLUI+/h3MqKgjpMrVnNkyUac4rtOnbEeB/2cgg1WnSceFx0q3oMNSdsdJKbi3VhdKdTfqXGwZ/eBc10KFjSV8/b2QdQ2lbG6rYig7kQgGehtYnhBPUeVbuC40vW4tMTGa77vc/J6m8FFklJXCSSLqASSTaToY/TSoxNIIJuDfu5fMY6n1o9kR7jjfvdFzWW8umUf7lk+jp6eNqYO/pLKwQsodgURwOEeJy9GwkbDNaaoGnaOhOb9klN+j6+gqCY5ZXfhCI/27YTk5oibP68bzSOrD2JVa8c7+M/d0Qs2x/672BXk4v6LuGHfz+id1xpXfYl8VvYiRF/jFyvpRnVhZRdDO7c6BQyJo/tKl4J7lo9jn3cm8uCqQzpNHnva2u7jN0uPYti7l/P3jbHtnUYmebC+YxL6vgLuBuuLdjdAn1didaTYSHes9TFjw1D6vH0Zv1h4XKfJY0+N4TweXHUI+7wzkXuXH44eRwt2iFOYGAcRmbu7sLIXlUCyS6GRi8o00e2K5cZwHifMOZ+blxxNIGrsCbSu3ccFX57BuC9OoIew6YgLZysMegpcTdaV6doZK9MZ3xO81XpoDg794jiunncmLaGuN43sTCDq5KYlR3HCnPNpDHc9CcAtRKfbw3RPmt5iR0kfKoFkF0Od793N7a8L+Th+zvm8V294hvBuPt98ML9ZauOx2e5GGPIo+NeZL8u3FoY8lpoB+k7cvGQCczePtaSs9+r7c8Kc86gLdX2YoIktUlK/QEZJGpVAsoowNKiws4uvdERqnPX5D1mws8JoUB1q023eFsnVDIOegF5vgqM98esd7bFrBz8ZK8tGbbq1X+P5O3ty9hc/6PIclJ3Gt2pJ8cCXkkxqEN0OS6aUEhbl6JEeaKIHsS9VC5IWfM41DJ1u4I4GQAtQkuhFzVKyU5cdHgx169Ij+bChn8FwumDzTRcAEYWyD6FoHjSOhcZDINRND4u7EYq/hOK5tnVZ7cVp/S7pH9T359alR3L38A/2+lm9Lmk1PtHM+C9tznVeCtsGE9W8fLPbtKQFTeykPbKdsbPqDJetGKISSLLNv7YIrf1oBMchxFhgf8KyDCRoezzhCSAQldRUbgRqgU/Q+Ihg5CPGzur+yU3IdUgGGAnz83Z9rw34lrcW88eV1nSN7MW7KTnlGuFshfL3Y3/ay6BtAISLIPJ1N46zDVyN4FsPnjS8R/k2JqXYP64cy6UDahnq3717bm7Q1DTl9XG9atG5bvSKY0CORzIeGAXtvYnuMXYmiM1bcDuhprIeKZeiiblIMRv0Dxg9076+xRygEkgyzJ3ow+04E8SFEDoZROz3HF+rXwD9vv5zGjrgdjVQM+VfoD/LqJnvIDopSbIWOLLDn3XjnUBkrwRy69IJhPQkDHZrYfAm56ZnmqcuPZNEV7wbYr9T3doFmiHdwa1LJ/D3Q17f7e/fDRpcAxLT+cCTRFBTeQrIC4iK74OMbyrZd0oRYgKSCSB/DiJCTeVbwDOEIq8wdlabmcCVvan9+a20ZEopITkVwdUYnFIbh4VI8RDObX9lxAu7n6taXXkLgjuNFDrAqbF6QP63g2L1IS9935xEu56EZ4zi+dD3ZevLzWUbzoYdB1perFOLsunkRyl3x+69OjBwXbOJRaDit4yesftndPlUD236ZQj5cyBJi3SoR/II4cgjqqvLOmoQ3QrLp3qonXwTYbkGwW0kL3kAjETIx4mWL6J2yo92/5H+idFC10V0Xm79rpfsxU37JSd5ABR/kZxyc1nJ50kpNqI7eGbjd6cuvtAaNreDgOCzb/9bIqidch6B6BKErCJ5yQOgFMFtuJ1rqJ5yM8unJnfnyRyhEohZCyuPIxitRYq7gfwU1rwvUr5MTeWbVE+NjXI7tc8xMU3ytoYQIRm7OTy7rbclQe6lx6LYWIJiLd96KFyclKK/+SyEpOR3DUbndwCg0x6OZbrFUwZSU/kOUv4DGGw6yPj5EfIugtFaFlYel8J6s5JKIEbNnuakZvId6LyNpOODsVPjJES0htop5zGiqgX42GhBi8NR7twR6xWbu6OXVfF9xxGE3m9YX64S0+t/sd+xxRY1xT4Lt+8IsSRsagD9U8bO2klN5YVEZDUC+27gkqHovE3N5DuYPU2NBRukxkCMmH9tEVroZVu/AB0R8m5gC1I8bLQIh4CXKnyc9f7P0SNdLyZLjISBz0LBUgvLVPbSvD+svQArv9qas43Xjn2IH2xtI2pmpxbBr5CUAzdYFZslJLPR3Wdx0IM77A4l06gEkqh5V/fBqf8XGG13KJ14HzjGTAH5QtCy7JrYlFYrCAm9/wUlX1pTntK1xkNg0w8xujPzXjx1+Pd7yMzaj2/MBZI0L9y0GiLaaRz8SBrNL09/KoEkIpY8PiK1fbb2iPhg3U+gbZC5chzt0OefULjQkrCUOO0cCZvOBLMnMOavhP7/AEfAmrjS2yoi2lEqicRPJZB4zZ1YiMv5HgLr50qmLQ3qjoBtJxhbY5C/Evr8y9Z9onJaqBg2ngmtQxK/1hGEnm/FZsyJ1O8wbKOFII9WCxDjoxJIPGZPc1K67W1Mdg1lrIgfGsZBw1iIdLPbqxYB/woomwP+1amJT+la62ConwDN+4DsZrzY3QglX8S2asmNVsfeJLNpqDiZ46aZWjGZC1QCiUft5LuQ4ma7w7CfgEAvaBsIoZLvkomIgmdb7I9/tbHNCZXki3pirZFgTwiVgXQAMra1vbsR/KvAs93uKNPFHYyuutXuINKdSiDdqZ5yAkK+iZryrCi5REfjREZWzbY7kHSmEkhXlk/1EIjWAMPsDkVRlJRbgdcx0sTu2FlPLaDpSiB6A0lIHhUOwWEeB4OdGr6vt1Bv0CXLQjpfhKK0GT9rQVGylleDsW4nQ12CckesQ6BZl6yJ6HzeHqXO1CKVDu1LIHodcK/VBWcL1QLpzNyJZbidawC/FcUVaYIrCtxcWODkQHfnO9y2S3g/GOHxpjD/bAtjZtshRcl0TgFn+lxcUeDmGK9Gnuj4liWBee1R/tYS5ommME3Ssi9OCy4xiOEz6q0qMJuofv3OuJ3XYEHycAr4VZGb1QPy+X2pp8vkAeARcLLXyQs9vSzsl8/pPtVIVHLTGT4nC/vl80JPL6f4HJ0mD4g9CR/icfBAaR6rB+bzi0IPDmsej/OJyKstKSkLqRZIR6qv9yMC60AmfLrfrvo5BS9V+Dgsz9yZGo81hbm2PkjQuqcqRUlbHgEPl+YxsYfbVDkft0c5b2sbm8w34+uRvoGM+UOaHEGZPlQLpCNa4CyzyWO4S+OTPvmmkwfAVT1c/LuXl/wunsAUJRsUCMF/e/tMJw+ACR4Hn/Txs7/L9G2uFNH6Q9MBZSGVQDqkX2jm6v5OjTd6++jntO6Gf7zXyUu9vFhYpKKkFaeAl3t5OS7Pum7bAV9/F/uY/uIIU/eEbKUSyJ4WXV6CFCcavdwp4B8VXvo7rf/Vnux1cmexOgdHyU53F+dxotf6Mb8BTo3ne/rMjomcxPxrEz1iN+upBLInPe8YwHC/03WFbo6woNuqM78s9HCwJ3nl5xr3V40UP7iAkj/Op+DFFXgWbEeEDJ/JpRh0WJ6DXxSa77bqzASPg6nmusVcaKGjrIonW6gpPnvS5bFGpxYUa4Kbisy1EHaEPbxf15/qpgo2tufTEnaR7wrTy9PKgT22cWTpRu4piXDK5jZT9Sjge38jJfftvcW8dGu0jyqj7di+BMb3RibhqVjZ3d3FHj7cWcRbdf1Y3VpGKNwDDfA6Igz27WRMj20cX76OQqfxNX23FHn4S1OYZqOTUYQ4FnjNcABZSH0z9iSMn1dwaYGbYi3x7CMR/G/bYB5edTBvbR9IVHbVMNTpWbgKX99XaNOajIaqRHWKqmo6/JEI6eR9uY28L7ehz6yl9bRBtPxoH6IlqvswGVyhUs748AKCwYouX+cUOqdUrObnQ+ZxYvlaBIklgjKH4JICF9ObQsYCFfIwYxdmLzUku6eayjqg1Mil8/v5u13nsaflrcVU1pzE29sHJlZZr/9BmeHTa3Oeoy5A75+9FffrZZ6T5rP3ofncfZEJvsdKN7YdD9sSO9zzqJINPHbgmwzPT2x939x2nUM3tiR0zS62M7qq6yyXY9QYyK7mTizDYPKocAjGJHhj+duGEYyafUniyQOgeb/Er1G+JRI8XU8EI/R45it6Xv0+7iUNyQkqVxn4LH/Y0I+D37+Y5zYOT+i6QzwaJQZ6Cb5WTs3kYqMXZyOVQHblFYafLg7zOBJqzt23fBw/m3ca7brBXsRAb1QDMvWcG1qouGEOBS+ssDuULKFBN11XnQlGHVzw5ek8sCr+XmcBHJpn4rYnUS2QXagEsivdYXia3qAEpu3+34YDuGnJUUgzCUDPg0i+8esV46I6hU8upnh6NaiNL80J9ej+kKsuSAS/XHhsQi2RRL6re9PUVN5dqASyG2F476vCOCeZL24u5coFp5hLHt/QkzftUeme/79rKbl/nkoiZkgDRyXvWQSCyxacyrLW+HqXjEx02YV6atuFSiC7EWGjV8ZzD5EIJtecZLzbaq8C1dtnN98HGyme0fFsLiUe1nTDBqJOJlefHNeDmblVPrrBKVzZSd2BdqVHg0Yv3RbHWQT/2TqED+r7G61ib061t1s68P93Lfn/XGl3GJnJ2WxZUe/WDeCd7QO6fd12M+eGCNQCrF2oBLIr4dhh9NIV4e6n9UxffZDR4vfmaAeH+iyni6K/LFGzs4xwBCz9HD+46pBuXxPPd7VTDrHT+MXZRy0k3FWLay357RID7eovQlHaZWwr6o40hL28tX2Qufh25VtrXVlfE6EoBX9fhu+9jTi3B2zt29eL8th082e7/6WjPdbL6AiAux489eDZCv414G60Jc5vRXVKHljA1keOUetEEuVfC02JTcftzBvbBrMz4ul0xXpQSr40vlWNjtux3nBwWUi1QHY1/oEAsMXIpW265L1A5x/M9+r6oUsLp93mL7euLABdUnbbZ/T4x3KcW9tsHxgO9+9gtmTUE5t51l4OzftD3QTYeBYs+wUs+yVsPgPaLOwiTJBzQ4ua3mtEwTLLiopIjXe76MZ6NxAlYLwBslGdj747lUD2JKThEdG/NHc+vjZ/Z0+jxe5NhKHQ2oFb3/sb8VTXWVqmGeG+3fdl7yZUBPXjYNVEWHYtNBwGVk1WSEDBSytxNKh7TEJ61ILD8PDjXmqayjv92Z+7+I7GodbMxdlIJZC9iE+MXvlKW5ilnfSvrg/0MBzRXorng9Pa8Y+8edstLc+scK+hxi8OlcKm78Oy66H+CFL5MRfBiBpQT5SjHUo+t6y4tYHCDv9+cTjKa20R4wUL+ZHxi7OTSiB70oXhD0lEwq/qO36SaopYtGbD2QY937WmrF2ZGVhMgnDZaPOFRPyw+XuwfAq0DjJfXpz8/1mDCJq4UeWisg/AZc34dFtk75anBH5RH8TU6baSOSauzkoqgewpHP4AhOHpNK+3RZjVwW6fTs2KG4qE3q+Dw/rpu6GRhrYASw5NEC4xvCny3torYPVlsPl0U6ue46W1RfB+vDnp9WQVRzv0fQUw/yDj1PYu49GmMG+0mVoBUk99T7V76R5UAtnT2FlhhHzdTBHX1Ad5N7BHwrBiqmL5B1CYnG7Y1pMHEO6fHotsIz0LkE4Lu/wAEFB/OKy6EiJWl7033/sbk15H1slfCX3+bbqYMs/uD1hvByJcVx8wW+y/OG6aalbuQSWQjkS1Z81c3i7hzC2B3Z54BuabHKAu/wB6vmOujC5It0b9tHFpceZFuF+v5BUe6AMrJhnewC9enpo6dbKhESWfQ5/XMNMSGeL/7rv237YIZ25to93spEIhnjNZQlZSCaQjYx55E8RiM0U0S8kZW1u5b0c7UQnHFhvs0nC0Q9+XoedbkOABOomK9PZTd+cR6AXm9ycyI9xnUHIriBQQbbyK8IB9klaFCOm4l9i8NiVTlXwOg/4KLmPreo8u20BEwr07Qnx/axut5nvFFjFyxtumS8lCKoF0RCBBPmy2mIiEXze0M25TK07vFlyeRIZW9NhU3aEPx2ZdpUh4UA/q7jgC6bNvjWm4pzWLyroiHYVsv+TPRMoHJa0O9wrDGxso+Sth6PRYy1uLf4qvz7uVbY46Dt/Uyk0NQczsWvItKR5M+PjDHKEOlOjMonPd6OULkZiYT7o7R2AA0caDoWn/2AyhPQkJni2xhVXFc8Ft3w3Is2A7Zbd9hrBhdtaWm58kUnRwSupyNm6k/JGf4Wi2fg1M64n9afyFhdvX5KqoB5pGQsuw2Gy6iG/3n2thyNsCBV/hKlxI2J3YKYXdWIXXcYBaQNgxlUC6Ul15DoIXklJ2xB9bUS2/3vbC2QquxliXVZrwfrKF0rvnQjR1SUS6NTbe/jloqetGc6+ZT8Wjl4Nu7ZhF6ykDaPz5gZaWqRA7CyecHztWUkTB1UTyunfljxg9859JKjzjqU17ujLziyVsO/RIYIjlZWvhWAvD3Rj742wBLb0GXSP984n09OL91NDuLsbqHFRG66GXGrrWuW013oXvkLfiU1xbVyLdXnR/92dERIt6QzSMZ/U8Q/V2ZucVI4j28nX/QiUxIhJbD+UIJPuB621Gz7wlmRVkOrWZYlcEkgX6xWiOGpAldodjh7YT+qO1Rih6NDW7OIT79k34Guf2NRS/cheeFXuvZm4fejiNZ95MpLzrc+ebT5pE3orZuNea38tK7+Fmx+RRtI8pM12WYpsdOCKX2x1EulNdWPGorvwJAlNTezNdj78vo8f/LU16PTvP+xHNY6fF/Xr3+oWUPT4JLdj5uRJ6XgF1Vz5GqP+ILsvSxEq00pmY6Q6RDhGbCu1Q81MymhDnM2rG83aHke5ypwWyYMoIBEegyZFIRoLoDbIUKAVCQDsQBNaBWAcsAT7DEfyUEVV/p2bKGJA32vgvsFXTT4YhWkIUJQ31rAAAIABJREFUvLIqqfWEK7q+ye9Ka2+l9Olru0weAFqwmdK/XseW6/+J9HTepaTLfdC9h0LhwrhjULKQFPcwesbzLJ/ag6A+DuR4kPsjxSBgIJBH7GhbB4IGJA3AZiRLEHIhwvEZI8vmIaal1/5ASZC9LRA5TaN26/GgXQDyFKCP0ZKAz4GXgXOAQ60KMeNIKH5oAf431yWtis23vULUH9+QU8G7f6bwf9PjLnvnadfQfFw3vRLuehj2MFZsqaFkpA8R4kWkPAcYj+FxYtEAvAP6szjq/sOIF7LyKNzsSyBzJxbick1BcBXIBPcEV7qlS0rv/RLvR5usL7rAzabffhH363s+/GNcG5bE/fpQvwPYds3fu39hvxehqDruchWlS4I6kE+iiT8xoip1M1JSIHs6aquv91Mz5Xe4nWsQ8i6VPJJEEzTceAjBsdZvBRLu3/k5Dh1xbk/sVEZXvK9vtHAjR0WRlCHFr4iymprK6cydmDWzK7IjgVRXfh/aFoG8FSiyO5xsJx2C+lsOpX2EtRPTwn2Te5pg3EPjrQMh3P30X0VJUB5wNW7nMqorf87z52b8MorMTiBLLyugpvJvCF5F0PU8TcVS0uOgfto4wvt0fHiPEYkeIhUuS+wtj3/bEgE7RiVUtqIkoBjBg+xf8SaLJ/a2OxgzMjeB1Fw9ilDeXOBCu0PJVbrfRd0dhxPpa8028OHyxG7agVEnJfb60SfG/+KdIxMqW1ESJ48n4vyS6slH2R2JUZmZQKonHw76bGCY3aHkumiRh+13HUG03GuuIAGRssQmuLVM+DHRwvjGYqKFPWk54vz4Cw/2BN3eXYmVnNAbId6idsp5dgdiROYlkJop30OId4mt31DSQLTCy/a7jkAvMn6WSKTcj+5MbExFevzU/+wB9LyCLl+n5xVQ/7MHkJ4ONrDslAbBjO5dUDKHBymfpXbKZXYHkqjMSiDVU8aBfB4w+birWC3SL5/tdxyObnAb+Eh/YzfrUP+RbJv6DMGhh3f48+DQw9l2zbPdrkLvUMDo0iFFSZgDKR+nZvK5dgeSiMxZB1JbORzJx4CaHpPGPIsaKPvNJ4j2xDaGbP7+Cew86k+m6nZuX4tn1Vy0wE50byHtQ8Z2uwdWl0q+hD5qI1YlpYLonMSBVR/ZHUg8MiOBrL4kj2bvpyDG2B2K0j3P/O2UTUvsLJGGK6+mbeiVSYwqcUdUfM5vD7qXiBQEpIZE0KJrNOsOWnQHO6STuoiTrVE3WyMutkTdbIm41clDillbcXBgJiw6zIy9sFq801XyyBztB5XTcOMhlN7zZdxniYTL0u/cjGDER8HXW+zH2+wNSo21YQ9rInmsDOWxOOTjq5CXoMys3mLFVj2J8iSS76X7SYjpn0Cqp5yAlFfYHYaSmMD43uy4aiRFVTXdvlY6NSJF6bfuomXPk+/ikCd09nMH2M8dgK8vj0rBqkgeNe0+5gYLmN+eT6uuEorSpVOpnXwJzHzS7kC6kt5dWIvOdRMtXwAk5ZBsp4BCISh0CLZFJC0yrZN9RiqqqiH/9TVdviY8sIStU2anJqAE9PFt4R/HXGV5uVEpWBL2MSdQwAdtPVgbybO8DiV5fJqgWBO06bF7Rjh5t416XGI/hs+w9IxeK6V3CyRSUYmQliUPp4DTfU5O9zo52utkiFPDtUsK3alLPm/XeScQ4e8tYdZF1I6sZu24aiSudS14ajo/czzcLz1nO+lJ6nZyCMlIdysj3a1MLNzC2oiH99qKeKu1UCWTNDTAqXF+vpMTvU4Odjsoc3x30whLWBrW+SwY5cW2EO8EokSsSyilhOUtwC8sK9Fi6dsCmTvRhdu5EjC9QZJLwKQCNzcWuenrjO+moAMvt4a5rSHE4nB6HTWbaRxb2+g15T1EW6TDn+885wc0H3ZHiqPqXi/vNl44NrUD+wtDfv7XWsQ7bUW06Bm/VVJG28+lcWeJhzN9Lpxx3inXRXTu2hHiyeaQVS2TNiKOQRw8fbslpVksfTtiXa6LsSB5jHQ7mN83n4fL8uJOHhD7xZzjdzG/n4/fFntwpG+qTXvRnj52XnpApz8PV3T+s1wz0t3K9cUbeaXPEn5ZspFBzqSe+a10QANuK/ZQ3S+fc/zxJw+ItVYeK8vjsz5+9ndZcnv14YxOtaKgZEjfBCJkpdkifuB38XkfPyPcxv+ZbiG4vdjDP3v6yBcqixjV8r1BhId0vPFiuOzgFEeT/vKEzpn+ev7a+yv+VL6aQ/O6PnVRsYZfg1d6eplW7MFj4ut+kMfB3L75nGZwYe0eJjF3Ylruq5OeYyCxRYMHmSniTL+LFyq8CT097Kou5OOlTcP4+7bezN3Ri0DEh+5ogyGzwBEwE1puEtD0k6GU3jV3t7/WfS6i/sR24c0lAjg0r5lD85pZGPLz153lfBLsYXdY2Snqp3XZlfxosRevs41Di7bw44rNnN1nGWXutoSL82vwz55ezt4a4PVOum/jVI7bdRLwHzOFJEN6JhDkT80Mz4xxa/yt3FjyWN5azK1LJ/Dy5mGE9uyDjvhg3Y9h0FMg1IytRAXG9yE8uAeu1U3f/l1kQBmI9G0Ip5OR7lbuL29lScjHzB29mN9uzS7ICoAGa38CoVJ0oDXi470tZby3ZSTXLDyes3ov4/b9P2aovzGhUt1C8GxPL4dtaGVpAgtrO3AhaZhA0vObK8WpRi91CXi6woc/wX9ZRGrcvORoRsy+lOc2Dt87eXyjdQg05u6x6KYIaD1l961Feg+y/mTDbDfc3cbDFat4oHwVQ1xBu8PJDnVHQFvH296EdAfPbRzOyNmXcvOSo4kkODuvQAj+3tNrdhz1VOS0tLtfp11AzJ1YCBhedT6pwM2YBMc86kI+jv/4fO5ZPo5wPDNftpwEUbWfoxFtx/VD7jK4mN93kH3BZLixeS080XM5U4s24xNqyrlhET9sO6Hbl4V0B/csH8cJc86jLpTYItMD3Q4uL3AbjRCQJSzcmnaH1KRfAnG7JgCG5i+6BNyQ4JbiOyMeTv30HD5s6Bf/RXoeNKhWiBGjy0KMGP/dl29HqdqhxgyHkJxXsJ1n+yzl1AS7V5SvNRye0NkvH9T358Q559IQTuwh8pYit7lWiBRHm7g6KdIvgQhpeE7nyV4n/RIY+NCl4MzPfsSXO3omXlnj2MSvyWGFWoRbStYzvWIlhxz23Zd1Q2HH27AriSn9+vd7T9kaSjRTA7Y5RkDjIQlfVd1UwTlf/BBdxn+/GeDUOMlrYthZJGdHDjPSL4FIYXhKztn+xN6c+1Ycxnv1BpeahIohqPrv43F4XjN/7bX82yfkAw6NrbYuqnCz09XXztCyzpHeJv7a6yuO8e20O5TMEOwN4a4PJOvM7Lr+/H7FYQld8yMz03pl+p3Amn4JBDnI6JWH58X/5mwO+rlj2XijVcW0DTZ3fZZzI7mmaBP3l6+mxBH+9u8H7OfB5RYUDU7sBEIlPoWOKHeWruWWkvV41dhI11oHmLr8d8vGs6U9/pMuj0jgHtWBIWYuToY0TCAYmuTuFLGtB+J1/4pxBKImZzGH1NlWnenvauexXis4t6BurwnZmgYVfZ04+5reaEDpwqn+Rh7vtYLBaqZW50LmTsYORJ3ct3xc3K8f7tKML1AQxu6NyZSOCcRQe7JUE3H/Y8K6g6fXGzjidK+COl5ZnevG5zXxeMVy9nV1vuCyop+TQM/9UxhVbhroDDKr5wpO8akB9g4Z7L7a1dPrR3Q+7X8PTgFFmsEUIo3dG5MpHROIoRlYzgS2GXmnbgCNYbXrqdUEcGGP7dxTvha/1nXXSUGJg7oSU5sNKHHKEzq/KV3Pz4s3YfTelbUsWBDcGM7j7e3xH53sM/4mpN3C73RMIK2GLtLj/yB8lMiU3a4INdvlGy4hubV0HZMKN6PFcYiay62xoUDNwEqlc/LruL9sNX6hdpf+lgh3/5o4JDIZpzlqOGm1GL0wWdIxgRj6Je3QJfVxJpHFzeb6Pb/lTttzXlKqQIvyp/JVnOjbEfc1vv5ltGvxDz4q1hiX18z0nqsoVVN9YzzWfIcXNZfF9boGXdJk/OA6lUDisMnohTWh+J6sNicwa6JLeVutKSeDlTvCzKhYyYGexBqO4ZL4m/yKtYa6AszouZLezpDdodjPs82SYta1xTe+/XnQVOtvs5mLkyENE4hYbvTKN9rie3Pi2q6kOyIC/lXmy8lgvRwhplesMjTLp96pEoid+jrbebTnCvbJ9Rla+SvBgtZYvPtj/bPNVJeZ4XtjsqRhApHLjF75fGuYeLoXvZoF/Z4FK8GRu4f99HOFmNFzJX0NHni0WVNbuNutRIvwUMWqLmfLZT0tBP4Vpotxa90/vOrAa2a2dZcYvjcmS/olEOH41Oilq8M6r8bxBg32NXX7mm6Vfmy+jAzV39XOIxUrqHAYT8Tr9H0tjEgxqlCL8Kfy1bl98mHZJ6aLGOzvfuX/My1hNpk7MN3wvTFZ0i+BjJq+Ethg9PKbG4LdnkU8qofJ44XzV4J/tbkyMlS5I8yfyswNwtbtyGOLphJIuih2RHi4YiUDczWJ+FeBf42pIobn13X586CU/LbB1O83SjhiPtNZLP0SCIDgXaOXLg3r3L2j6zfqpPI1RouPNXl7v2r8+gxW5IjwQMVqejnNdQGuDQxET78p7Tmt2BHhjxWrKDPRqsxofV6JfbcNOrViTZc/v70xxNqIqW1lvmDsrLTb4Cw9EwjyeTNX37GjvcsB9TGF29nXH/+U028JCX1fAU+DiegyU57Q+X3ZGgY6zQ+6rg6qPcTSUU9HmN+Xr8nNdSKeBuj9OsSxhmlPvTytjC/ufPLo860R7u3moTYOpu6JyZKeCaQ9+iZgeIJ2VMLZ21r5oJMpcwLJNUO+TLBUCb1fg8KFRsPKWAL4dckG9jdwLnRH1rYOsqQcxXr7ugLcXb4WVy4e2Vw8H3onfmrs1MHzcHUyiP5OIMKl2wMG0tJudHRdJZC4jZ0VRsgnzBTRqsMpm9t4urnjZull/WvplxfnYLojCAOfhZIvzISUsa4q3MwJCSwS7M5qkzugKsl1sKeFa7p4os5qpZ9Cvxfj7s4q97RROXh+hz97pCnEqVvaaEtgl4wOSfkfDnx0o7lCkiM9EwhAVD4EwtRKp6CUXLI9yLlbA2zYY/aD3xlmxui3uy+kxyLYtwoKlpoJJWOd6m/kQrOTDvawtsWirWSUpDnTX88Z/tzrqgWgqBr2mQn53U/vfXjUOxS5du+e+iqsc+bWNqbWBTE36epb91tSShKkbwKJZdxnrCjqxdYwQ9e3MLEuyNx2/dvm5A96rWRC3w5aFVoYiubDPo/BgOfAlZs7mQ5xBfllsbUPPk3hAnaE1C7GmeCXxRsZ5Ta0NV3m89TBoKdh8F+gsKbDxYbjes/jx31iD5ZRCe8HI1xZF2Dkhhb+1WrZVjFzGDPzQ6sKs1p6T4XRo79F084DTO89EpSSx5tCPN4Uop9TcITHyQi3xjn7vs28cJCALsDVBN5N4N2Y8xsl+oTO7WXryLP4QCLV+sgcTiH5Xdk6Lt0ylJ16et8qksa/JvZHd0GgHwT6QCQfr6ZzwbCPmdYYZUkoyjuBaNx78SVAonOj1YVaKf03d66p/C1wu91h5JrbStcltDlivF5ffxL3Lbza8nKToZd3Gy8ce6XdYdju/UAhv6lTW8/Y4G+MrrrI7iC6kr5dWN8IRe4FcnP02iYn+xqTkjwA1rSqUwgzzTHenZyRn6PjIfbZhnBdb3cQ3Un/BDJ2VhjBxUAOb9iTOuWOMNcmcQbO2mbVhZWJfl60iX4utXtvikiEvIxRD6X9dt/pn0AARlUtQYirMLLKR4mbAG4q2UBBHBvDGaVaIJkpT+j8unh9BvR5ZwN5F6Nm/tvuKOKRGQkEYNSM/wPutDuMbHaav5FD85qTVn5Q97AtGN/BO0r6GeNp5Yd+dYhakj3PqJm32h1EvDIngQCMqroNyaN2h5GNCrUIlYXJXTy2vqUvepznJijpaVLRZspzdb+s5PsfXsfPEJnT05JZ32aBZHRVJfCA3aFkm0lFWyh0JHcPJNV9lfn8ms6UorQ7GC8LiFcpaPsRQ6dn1JbImZVA4Jsk8gukuAHIwV3frHeAp43TU7DqeF1L36TXoSTf8b4djE7wCGOlC5KHWbrtLAY/lXHHQ2ZeAvnGmBm/B3kqgq434le6NaVwc0oGR9e0qBZINhDAtUUb0TKnpyVdtYK8kDFVP+e8FzLyYThzEwjA6Jlvo+sjkPL/7A4lUx3j3Zmyp0m1Cj17DHUHOcXIkQjKNz4AbSyjZz5rdyBmZHYCARjz6DbGzPwZkh+AWGx3OJnEKSSTClPTnx2VDja09U5JXUpqXNpjK85c3PbdnPVILmZU1bGMfiTjd2jN/ATyjTFVryGjxyHk3UDG9SXa4WTfjpQtDtvcVkFYd6WkLiU1ejtDKRk7yxItwE04tu/LmKq/ZtJMq65k7g5pC6YMw6GfgtQOQcoxCEYArux4W5JPE3BRQeoWuq5rVd1X2ejiHtv4b0sJIbXEsDv5wD1Ey++kpnL7170li0DOQ9ffStfzPrqTWQkkljSuQIqzQQ5BCkBmwpaQaedEb2NKt6ZY39onZXUpqVPuCHNKfiOvtZTYHUqmcAC9QPYCjgdA06CmciGSl9D1pzjo0TV2BpiIzOjCqq08mZrJs9HkUqT4FTDE7pAymQDLD4nqzvo2lUCy1fkFdWpGlnkjEdyGQ1tJTeUb1F59rN0BxSO9E8jCqydQPfkjJG+AOBbV1rDE2LxmhrhSO0y0vlWtAclWA51BjvAmbwucHKMBJyP12dRMns2CSYfZHVBX0jOBzJ1YSHXlQ+j6Bwgxwe5wss3Z+anfz2h9i2qBZLPzC9RyLOuJY9G0T6mZ8hjLp/awO5qOpF8CqZ58OG5nLYJrSMf4Mlw/Z3vKnxaDUQ917aqPPJsd6GlhgCujduHIFALkRNqiNSysPNTuYPaUXjfo6spKhPY+oJYsJ8kZ/oaU91evb+2LVL2PWU0Q+2wpSSIYiM6H1FReZXcou0qfBFIz+UYEM0C67Q4lW2lITrJh9fA6Nf6RE77na8ClFhYmkwd4lJop99odyDfsTyASQU3ldBBp80vJVmO9LVTYsBW3msKbGwodUY7Ia7I7jBwgb6RmysN2RwHpkEBqK38HXG13GLngVF+jLfWqBJI7jvfttDuEHCGnUl05ze4o7E0gtZWXA7+1NYYc4RKSCV57ng7Xt6kurFwxwdtEntDtDiM3CG6jZvKldoZgXwKpnjQSyXTb6s8xh+U147Ppi61aILkjT+i2PajkJjGTRZUH2lW7PQmk+no/QnsB8NpSfw46xmtP10JjeyEtYb8tdSv2UAkkpTxEeZbq6235ktmTQLTW24D9bak7B2kCxtu0Ulh1X+Wew/Ja0NSs7VQajmj7jR0Vp34zxflXDUWKa5JRdH+nxjCXRsnXn94WKVkd1lkW1snlXtn9XG0UahFb6lbdV7mnUIsw3NXGopDP7lBs4xSwv8vBYJcg7+s1UA26ZFlYZ30kGXcj8QuqJz/FmJlfJaHwTqU+gTgdf0Tisaq4gz0Orihwc7rPwQBnxw2qJil5sy3CXdvzWKDvhBxLJ4d4WmyrW22imJsO9zblYALROFgr5Nbydo73OSgQHTfDNkQk/2wL82RzmHntVp1kK90I7X7ghxYVGJfUJpCaq0ch9TOsKGqEW+OBUi8neR3dvnZrWyG31oxnyfYR4N4BFe9CUQ3kyA6iY/NsTCAtqgsrFx2YomOS04OAHWNg23HMCxVxU/kiXh09hwJ/x2NB/ZyCq3u4ubqHmzfaovyiPsjisBWJRH6f6kkjGfPoQgsKi0uKx0D0GzC5o64Ari/0ML9vflzJ46n1IzjgvUtYsn0UoEGoBDacA2svhEj2D+46hWSkp822+jO5C0vqqiPfqOHuQG6sSo/4Y/eSDWfH7i1oLNk+igPeu4Sn14/o9vJTfA4W9PPzy0K3FZv9CIR2o/li4pe6BFIzuRg410wRDgFPV3j5fakHVxy/7fuWj+PS+d8jEu2gx6x5P1h51ddvevYa6grgsWn6ri41NmbwOeihcPcPKErHPEJnmCtgdxjJFSqC1RNj95I9hKMeLpn/PX695Ohui3EJ+ENpHk+Ue3GYziLiPBZdnrKbWipbIOeCubGPv5TlcVF+fOdq37L0qO7fvHAxrL4cwgVmwkprw932fYm3BsoJZfA56O1hB5GoSiJGjcrmbqxIAay+ErrZZfq+5eP4zdKj4irykgIXj5XlmQxMuonknWWykLilMIFo55u5+tpCNxcXxLfP4kubh3HPsnHxFRzuARt+DDI7bxQjbPwSZ3L3FUBIOmlsy7WBYOsMdaf20LKUkQ5Y/+PYvSMOdy8bx0ubh8X12ssL3EzpYXI/WSF/bK6A+KUmgay+JA/keKOXD3Fp3F0cX2ZuDOcxqfqkxLYPbx0A9YbDS2tDU3zy4K7WZfgakIjuZPGmfnaHkbH2zdYurLoJsXtGnCSCiQtOpj4U37rp+0ryGOwydWuewJzrUrJIOzUJpNV3BGC4bXZviQdvnJH+7qvx1BmZPrj9mKwbVHcKST+nfYf8bMjwFgjAwk0D7Q4hYw10tuPOtpmOET/UdT+usaeGsJc7lx0R12v9GtxRbKq3P4+CcJxdMOakJoHoGP7H7OvUOMsXXz96S9TFE+tGGaso6oHGscauTVN9HSFbZ8JkehcWQO0GdbaZUQ4hGWhjCzgpGsfG7hUG/HntaJoi8XVP/STf1em6tvhE48tWJqVqDGTvaQpxuqDAFffMhOc2DKc5zjeoQ42HYHKWcVoZZHMfdDYcJLV0Q0+aAmrLNqP6uEJ2h2Ah8fU9wpiWqIvnN8a3g5MGXFRgYgKK1IYavzh+aZ9AzvDFv9bxze2DjFYTEyrOqmm9/Zz2fXlDURfbgmW21W+VqK7x8fL4BkCVvfWx8TNoufbS2D3ChLe2x98leloC9769SD0lH9rUJBCJob4Ml4DR7vhnR33SaEGXSWv29Hn3dNj35d0Q6IMu7T+vzAr/XnCQ3SFkrD42fgYt1xb/wHlnPmmMv1U+1u0wsS5EpGT2R2q+4UIYWmgxyKnhifMXGNYdbAzkG6lmj4KKzJeRJsptOL72G+tbMn/84xvV6weosRCDemVTC8SC3okNgXzCenwPxR4R2yDWEIEFN8PupeoR0dA/pjiB9NsQ9iQ2dbczkeyZ99/TaV8CyfQpvHv6v4+OtDuEjFRi0y7QSRE1PxYmETSG4x+ELzTeAknJ6ugUJRBp6NcgE5hAlD1D39YpsbEFkg1TeHf1ycqhaizEgCJHFiUQi3SySW+HHIm82AapaoEY2g52hx5/BilxBxFWzDl32rfxoNXybTybOhum8O7pgf+dRjCcuVuz2KE4m1ogFtwbBJLiBKY210eN3tNkSk6QS1ECEYb+MWsiOu1x/v6cQqev14Jty12N5stIAy4hbdtEEbIzgWxtKuSRt0+2O4yM4hISr42fQ0tZcG/o523BGefvI6DDhqjh3102JRC5ychVYQk1ofj3yR9fvNFINbvzrzNfRhoosPHJrzXiY0eo0Lb6k+lf8w7h1XkH2x1GRvFoWZJA/GtNFzGhZEPcr50fimK4ASKIvyITUjQLi2VGL329Lf4b4UnlJt9gdyO4G8yVkSbcNnadZmPrY1cPvnUa89YMsjuMjOHJlu1M3A2xe4QJJ5TF/4D6WpuJMUxp/J6biBRtZSIMn9P7bHM47iz8435LKDAzbbB4LtlySqEl40EGrc+yGVh7Ckcc3PiPnzB39RC7Q8kI7mxpgSCh+EvDV+c7wpzXd2lcr41IeKbFTC+CzKIEAp8ZvXBFROflODNxviPM5QNqjVXkaDf14Ug3ds7d2Njay8baUyMYcfHr58/nw68Mb7KQM1xZ8lAGxB4yHcY2KL1yYDU94nzA/UdrmPURM4lX+8TExfHXkopK6NH6MWB4Y6ab6oME4vxd3rrfHMrcBmZLlL8Hzuw5AMfWFkiWd2F9oz3i4paXzuOhN09VB091IYvSR+weUf5+wpeVuALcMuzTuF4b0OGWBlO7aAcpaP3cTAHxSk0CGfxUEInhjLgyIrm5Mb78U+wK8uiYtxK7gfrWQmlKEnbK2NkCyfYurF1JKXjxi8O45m8/Y2195u/9lQzRbFulVTonock2AsnjB75BaZyng/6yIcBaU60PPmTwUynZSTV1mxUJ/mHm8gd3hvhrc3xdWWf3XsbNw+LsNXPthP7/ABH/bK+MYOMCpFzowtpT7Yb+XPb4RJ744BjVGtmD4ZlE6UpEod9z4GqK6+W3DPuUs3ovj+u1f24KM7PJ5AJgIZ4zV0D8UrjbnXweMNUuu6wuwN9a4vvl3rn/h9w7/IOuX+RqhMFPgCslU6ZTKqzbk0B2hnrQlMVnzHclFHXy5IfHcOWTV7B8S+4l0c5EsmRTzd24mmHw4+DpetbmjUM/4479P4qryCeaw0yqN32KY5CI62WzhcQrde/s6JmNIF4yU0RUws+2BbixoZ1IHE81Nw79jKcO+g+ujga9enwF+zyWNdN299QU54ZtVlvflhvjH11ZsbUnE5+6nEdnn0BYtUZo0bMwgQC4d8DgWVCw9yRTlyPIUwf9p/uHWKBdwvX1QS7fHjDfWhM8z0EP7jBZStxS+84K/T5MjqlJ4P4d7Ry8sYW3A91Pc7u4/yIWH/sUB1TUAnrsiaHfizDgmawaNN9TQGqEjW1BZsqG1t4przMdRaIOnpkzgSufuIJlOdwa0SW0ySxOos5WGPhM7J7ibgB0RlTUsvjYp7m4/6JuL/9vW4SDN7Tyx52W7Fos0fXfW1FQvFJ/h6mtfBXJ960q7mCPgysLXJzuc3a69XGTlLwdiHDntjzm6zuBbJmX3rV/9VmS8g0V/7zsQp5eeV5K60yaUDssXGi6GKcjyvnjPuUH8QrfAAAdwUlEQVTyo9/D5ciysbZu7NSdnLHxALvDSBGNMaKQ68oCnOF3Uap1fHtdG9F5vS3CX5rDzG+38PMgeZkxVWdbV2D3TBx5ZVAk+kscjpMBU6fGf2Nee5TJX78JA5wa+7kERVoskbRIyZqwzldh/euUYbp/MaM0S41Un6+ourD29k1r5JMVQ7npjFfZv7ehnX0yUnM0S7uvOqRTLRu5ZDs46oIMcgh6OzX6OAQSQV1Usiyis9HcDKtOiBCSm5JQcJdSn0AOemw5NZUPATdYXfS6iM66CEBuPeV1ptmGcZBcWQNixKptFUx66jJ+fPgnXH7Ue7ic2f853a677Q7BFlEZW36wMpKi91jI33NgVUpWn+/KnscD6bsdWGJL3TlkayT1X96NbWoMpCtRXeOZORO44okrWbIp+9fLbI2o7e9TYCHNnrvsqNieBDLmD61I/TxyrU8pxTZELOkljFt9ezFtEfOntuWCVdsrmPz0pbGZWpHsHWTeFlUJJMmCaI6fMv4BW+6l9nVQjnl0IUJcbVv9OWBjilsgG9T4R0K+aY1c/peJLNmUnb87lUCSSiK5ipHTq+0KwN4RrlEznkDyO1tjyGKbUpxA1rdk500w2VbXlTPpqcv5/X/PIJhlXT5rw3l2h5DNbmNM1V/tDMD+KRJjqqaBmG53GNloQzi1XVgbAmr8wyhdCl6ddzCXzLqK6nUD7A7HMmtS3I2aMwQPMbrqDrvDsD+BAIyecQ3IX9sdRrZp0J20pnAR1wY1A8u0jY0lXPO3i2OtkQw/f31H1MmOaOonemY/cR+jqq61OwpIlwQCMHrmfcAkTO6XpXxHAl+1p64LQU3htcY3rZGLH5/E/LWD7A7HsFUR1X1lsSBSXMnoGWnzsJ0+CQRgdNVjaBwFrLE7lGyxKOxPST0SwUa1jYmlNjUW8/NnLuL3/z2DQCjz1lMsaVcz8iy0BqEdxZgZf7Y7kF2lVwIBGFn1BaHICBD3oVYEmrak3ZeSerYHS2nP0UVjySR3aY1k2jnsi0Op+exlOR3ELLyOMYx6ZK7dwewp/RIIwNhZbYye8Ws0jkAy2+5wMtniFCUQ1X2VXJt3FHHts7HWSFuGtEaWqARijmQ2GoczesZVDJ0e3+EjKZaeCeQbI6u+YEzV8SCOAf5HruyCaKF63ZmSufi5dAqhXb5tjcyazJerB9sdTpe2RV1sV2tAjJDA20j9BMZUHc/Iqi/sDqgr6Z1AvjF6xgeMrjoNwSCQtyFZQJYdtZxMC9qTPw6itnFPnS07C7nu7z9N69bI3GC+3SFkmq8Q8m6Q+zK66iTGPPqu3QHFI7Pm2I2qWg/cDtzOospe6OIkpH4wiJHAAUA5oB579vBZoICTfck9Y0YlkNT6pjXy+coh3PC91zl0yCq7Q9rNF8HcPJUyTu3AImABki/RHG8wavpKu4MyIrtOu18+1UMgeh1wC6Aegb5W6Ijyau9FdHI8gSV++sEM1rb2S14FdrDoPJBUOG74Yn71vdcpyAvaHQoSOHPjATTomfV8mmRBhPwT7dEHGDurzu5grJIZXVjdkQhqKy8nEF0J3INKHrvZGXWwJJy8AU1damwK9Exa+Ur3Zi85gIseq+SjZfvZHQpfhXwqeewtDyluxu38gOpKyw7Us1vmJ5BFlftSW/kWkj8DaiS3E58FktelsCVQQVhXPYd2q2/J56YXzufWl8+hKWDfGowP2nrYVncGGI7gVaonv8aCSRl/v8rsBFJTeQlRaoAT7A4l3X0cTN6XWp1CmF5irZHJfPiVPa2RDwKFttSbUYQ4A4e2gJrJJ9odihmZmUDmTnRRM+Ux4ElALXeNw7KQl7VJ2lpCDaCnn4bWfG5+MdYa2RlI3XqMtREPa9UGivGRlIH4H9VTfmV3KEZlXgJZPtWD2/k8yIl2h5Jp3mwtSkq561szviWetWYvOYCfzZrE+0uHp6S+t5P0GctiDoS8n9rJVcjMm9SUWQlkznVeAtF/A2faHUomerO1CD0Jn1HVAklvDS35/Oalc2OtkbbktUYk8EZbcdLKz2pSTKamMuOSSOYkEIkgP/Rn1HiHYVuibmqTsLXJmta+EcsLVSw3e8kBXDRrMu8tSU5rZF4wn80pPsQsqwgmUTtlmt1hJCJzEkhN5f0gL7A7jEz3P2ufEGVQ5s3aqqbwZozGVj+/fTnWGtlhcWvkP62q9WGe/C21Uy6yO4p4ZUZzqWbyaSD+TabEm8byhM6LfZZSqJluNGxGMvGof7+yHIe21IrY0k4GLSQ0otjfSuUJb3PqKPNHau+IOjl703BC6itqhSBohzH6kVq7A+lO+rdAqidVgHgSlTwsEZQar7WWmC3mBYcWHXlUyUevIxxDrYgrLYns/sg1tvq569Uf8tuXz6Wx1dx+af9sLVHJwzp5oD/NonPTvj8w/ROI0KYDqo/EQi83lxKRhr7sWyXiR0cVf3Te+MJPGgDQ5DBLg0snWvp/Pazw3pLhXPDoFF6dd7Ch6yNS8GpLqcVR5byDiFbcYHcQ3UnvR4aFV09A1z/8//buPEyK6tzj+PdU96w4OMwMAyoSETEIzKCCGnHFjWjUJPdeUSBu8SoK5sliXJ/EEHOzGPUmV2FQYuQ+GkHBNSZRVK57FMUFEHEDF0RhYIZt9u6uc/8YjCwzTHdV91T19O/zn07XqZdnpuutOu+p95DmOPeNOhxZ4DAiP0KJE+G6FUfR7DqQtxWKPoeiz8D07LrwL8o/5aRUGiwa7st32i4/overdTv8/7kbarDmsjSHFw7WwptvBB1FtzrygA+48rS/07ck+e0nFjT14b/q9s1gVCFgo9A8AJr3hlgJRY5l2tAXWJtIsCbu8kxLgvWJtDcIb8IwdFsT2VAKd8Ma1/0jaUoehcZwfkmUi0vyGVUQ+df/H7HoRJprd7rzcmLQezmUvQrFof3d+TKvoW+yCWQDhinHlL44v5Of99wrhzEQiUAidzbGfPnDIVzwp8n88JQnOGVE11PwroW7t1R2Q2QBadoX6g+HzcPBftWupxm4P1LA64c9B0DCwkutCe5tiDF7axux9OSSYizTgIvSMloGhPcJZOllJ4F5Kh1Dnd0rj1vKC9gnuuOUxK8+/jrXLz1z9wfv+Q70fwLyNqYjlFC5ue9HHFG4tdOfW2P+4cTci4/u+9LnnX5oTv1isKMyEV8ovLsCmpqCjiIQ3xj8IVd96zH6lnT+N/J0Uym/rBvYjVF1k1gfWPtN2Dxstx+79dAH+cGAHVvpvx9zuaa+hYcb0zKLEcMwOKxPISGe5DVX+B2hyIF7Kou4r1/RLsljY6yQX69Iog3N5mHw4RTYOtRvOKHzp839O9uVayNw3rGlL3xrt8kDANuzG2EVZqb9SzZ4ZeUBnHvHFP76xqHYDmpmPfbpY8vQ9u98F8kD4Nq3T6IxvmMj0QPzHB7qV8z0ikKi/m/R87Bc7nuUDAlnAll+yUBgnJ8h9jCGJ/v34nt7dNwl9rZVh9CabIvzRCF8MhHqD/MTUui811a0a+dUy4K4G60+ps+L93Q5wDTr0L6JV89VmNut1hpbC7jp8dO5+v5zWL91x47OjzeV8VGshyXYjYfC6ont3/kkNLbtyezVIzr82dTe+TzRv5hi/xvxXMTiS0LZ7jqcCSQRmYCP6bWIgYf6F3N0YaTDn8fcCDUfp7rixMAXZ8Dmjv9YstWsLXuRsIZW68RcYy89us+Lp44tf/azpA4e9UUhYa+j+VWirWUAXl45ZIenkVbrcNfmHrY4cvMI+Pw7kOIKxVtXjeq0A8mJRVFm9y3yWysoJy8ayg4c4UwgmLP8HH19aQEnF3WcPABe2rg367y09LAG1nwX2nrOksVPYwXuIw1lz9fHi4YdV/rSHcaksNd8ZK+eX10u7pUzy3m78uXTyE/vm8hdX+xHbSKUN8XetJV5Sh4AHzT2YdmWik5/Pr5XlGv7+Hylw5jx/gbIjPB9M5Ze1gc4xOvhB+U5XFu6+3bSC2r38zo8uPmwpovCe/b4COOc+MeBjx43vnLBhykfXUTPTyDGQIk2SNreq6sGM/eeCXHe38/TBTeU1nwbEt7b0C+oHbTbn/+8tICvRX1dbvUEkhTLMfiI67dlheR18Te9fGvndwtJadwfGnf/BxNyFsws8ltGUjX9Wc+jHJ8DCQSgTD2edmbjkSivHAxPHBNja5ZP8zUMav9O+9DVNaXQGH5V5mefFDuQd6Z+zccAGRG+BOKYw70eun+ewxm9up6S/ygdexZsGON/jGCsxphxVM+YzNC7Ol+fmQxjLNCSnrBCbM8+7e+DyK7Wl+Xx17Fx3huUvU8j9Uf5HuKjJLbxnbRH3i6rQVMS40jvB2dG+BKIxfM+nGf3ykvqH9TmpuFi0HCAr0feYJj5YEdSNSMt79dsE8r16WnlGCjz3T+s50pEoiwaCU+NaaEpy1ZluYWwdbDvYZqTqAc5wBnFPtacGDd0bYPCl0CwnpvznZLkLyfPScPMi41CU9ZMY60D8x2qZ4ynemZ634i0fJrW8cKqX78e31zRt7V9C3n0pBY+3TvtPT0ypmFQ+3fZp4jjJvW5b/tKIMZ/pkuzECYQ43ltYHV+cv+cAUX+Zm7+pSUrljHeC/Ygqmc8mpHRDZ9kZNywyS+APnoK6VIsWsizh8NrVZuzYkqrpX9ahtmnoCGpzx3eyasFSbGEbu/oECYQSrr+yK5KHUNZki/sjCjZ4OUUu2oN9XLeWgz/TnXN99L+1LE9Yz/K2Nhhs/feWtKbHMOKwXvyt7GraMsL90KLtvTcFAzrXdf1h4Ayx9Db+5Ns6FYrhOvb0P42jqdt0nql8Lbn2Io0TdvbsK6DN/Npiw+nquahjJ/KmkUZP0dY5OdD//TcseaEjb3354Fxq2notTLoUDqVhukrgGPKknv3FqC354cQ4+nmOpPClUDaX2Lz1IEsbpOfdj2578eU5rV6OU3YbQI7meoZ4xk9K02PWV2IJl7G4+8sK1X2y+n+WCmLR/fj4ZMKWFNZA8SCDmcXaZhmK8tr5vjy5G9KWz1XiGzovmfhSiDtGr0cVOdakitjQb6T4IJ907BVaTRNtZT0+AdxZzjVM2d161nHVzaADf3Wm2njODBo//aVWZIcawawcMx4Fg+fCLwedDg7yEt+35POnLfvO0kvzIlb2OR6zCDWhuqCA2FMIJbNXg6LW3gvlmwKgasOWERRxGdCz6/3d3x6bMKY86iu+RaHTu+ic26mOC8Gc96AFBXBgB7YwjyzKnhnyAzmn3oRcD0QjimAguRqF50pjsS5ekjys7gfxF3ve4UY4z/bpVn4EoiPouzLLcnX6/YqbOT6A1/2eqp2xQEvQDJ2ATZSRdWMrjvnZpJNPBzo+YNQUdG+tFdSUUlz/hPMPnMurhkFBF8/6/Wxr8N/8fWX6F+Q/KTJk00+bloNoVuwEr4EgvO+1yMfakxtivWqAxalNHe5g+gWKFrr7Vj/toCdzIiZpzLytuSrd5nyQcVzwJqgw+h2ew+A8lCvxAsh05+IeYK/nLmeqsoxYCcDya2BzYSCWshLYWvn7YytWM1PB7+W0jGP+tlkyjUfeD84M8KXQAzLvR76ZHOc1fHkp7EcY3nkiIcZVbou9ZOVLYYUGtem0dNETTXVM2eRSufcTJpmXKCzLW97LgMMHKj3Q1JmBoN5iF8el9/+dxw5GOyzwcRioSy1JAAwsnctDxz2KI5J/iv4SdzlhVY/0+b2XR8HZ0T4Ekgi8YLXQ2MWfr+pLaVj9oy28sQ3HuDYVJ5EnFj7fundqxnsNVRVjmPYjPC9vOfaOUGHEAjjwH6DNJ2VuqNojN8JQNVtK6maeQKW82nfDbN7lb0OkeRLMseWr+bpMfMpy2tO6TQ/q28l7v2WL05x5J+ej86Q8CWQkf2XAJ4rW7dvbeOtttTeXarIb2LhmHlcO2RRcqspKhdC1NNiMa/+SSIxkuqZN2KmJf+I1Z2+V/EahpeCDiMQBthnAOw7UC8apsLaSVzx5H8C7Uv4R9bcTTQ+HHikW+OINELl011+LN9JcO2QRSwcM4+K/KaUTvFGa4I5DT5WMRvzBkNuUxG9S2aai7Gem/3FLZxf20JDCu+FAESNy28Oep7lY2dzzj4ryO8skfT6GCp8Ft+T14w1P6aq8hgOuSN085+7SJjfBR1CoPr2hQO/DgXZ1mQzQIbbuPLJg//138NmfUF1zXcx5jx83EimrPzVTgvqBU6cCfus4O2xs/nNQc8TNandw9W7lrPXNSf9mkGHrF3g5/BMCedi9mVTT8fax/wMcWavPB6oLOpyb5DObGgr5oHPD2Re7V4s3tyPplgxCacF9p8F0dTuPjx6BZwLqZ4eunnPTllrmFv3OhjPG4L1CAkX1n4BtbVgw/nAGCqW5ZTkjWba2B23BlhyaSWYmzHm3G6JI1EMqy4mkiiiOK+Jw/Zcx1mVX3DW3u9Rnp/adNWX4hZOW9vIU80+O7q4ZgQHz/BcH86UcCaQZ6ZFKa/9DPA1sXx6cZT7K4vSsak9jzXGmbC+icbMXw9awE7j3Q03M35+uPsIdWRu3dlY7gs6jFBoaYE1a2DLpoDWW2QTcxM3n3xVhz9qv6G8HTLfTLCXA7P7FnFWL/9tiupdyznrmvwnD3iD6ppRvgPKgHAmEIClU24Afu53mOH5DnMri6lKslPvztqs5YZNbfxuUyuJzF8ElhLhfIbXvJXxM2WKtYa5GxeCHRt0KKHR3Azr1sLGjZDi1GoOcXHNUfz3ya90+NM3f1RKJHYj2IvJ8HXLANf2yef60kIKPJ7pjdYEZ69r5sMUVoV2HpC5iKoZd/kfKP3Cm0BWTC0nZj8mDR0oowYuKcnn2tICBkST+ye7wPzGGNPqW3k3hTfcPYqDuYVI7fUMn5/aMrIw+kvdMBzeAsLabTIY8Rhs3AT1ddDYhB5LdvEmn2w6jPnjO79lf+vycRj3DgwZ3951vzyHG/oUMGmP5Daqg/aluj+rb2VOQ8xfzeMrq4msPyCs14XwJhCAJVNuxnBFuoaLGDitOMrpRVGOK4oyKGrI3661cp1rea0lwTMtCeY0tPGZjzV3ybNLcKLnM+K2Jd1wsu4zZ8ONYDqekhBIxGFrAzRsheYmaGmFWPh6DXa74l43csNR1+z2M+9+v4S2ot+CvYxuWAg0IGo4ozjKt4vzqcp36BcxRLZdNuIWPoy7LGiK82hjnBda436W6u7KMpWRNTVpHDGtwp1All9URqJgBVCZieEjBnobQ5EDm1xo8trkzJue9dSxs7vX9iKa9yowLOhQsobrtieRRKK9+N69f4/hYJxWSosHM76i684Gb19+FK57JzA084F9JWKgX8QQ29YY0XNvq64tpy1+CKNnhfbOItwJBGDZ1HOx9u6gw0gv8w6OvYARNam/AptN7lt/IK7zGtA76FAkm9gaJlZMTeqjH11QyJbiazBcR8+aMrUY5wSqpj8bdCC7E/4EArB0ygLglKDDSIMEcAslTb9g0P+2dPnpnmBO3Xjg/qDDkKwSw0aGMql0VdJHLLt8NNa9C6jKXFjdajrVNT8IOoiuhO9Fwo5Y91wgTdsIBmYVmBOorrk6Z5IHwMTyecAfgw5DskoeTiK1FZhV0xfTFh8F9hrC0ireM7uEkqYrg44iGdnxBALw1qWH4zjPA9n2mq8L9lYaCq9jzB+8vY2U7aw13Ff/JywXBR2KZI0E2BFMrEj9Rdoll47AifwZaw/PQFyZth7sN6iemfzTV4Cy4wkE4ODbX8VwPu3TQNliFZixVM/8cc4mDwBjLJGyyaAXDCVpETA/8nTkyNvfZkXtGAxXAtn0vduKcU7LluQB2fQE8qWll00EczfgeWv6bmAxzMThaobXBLfXQdjcYfMoqXsQzBlBhyJZYSvN7j5c1Nf7Vq5vTh5CJHIncGz6wsqIRqx7JiNv/7+gA0lF9iUQgCVTJmCYTRinsyyfgLmIkTMWBh1KKM2zERJ1v8aaq4MORbKANZOZVDbL3xgYlk69FGNvBErSE1ha1eJwejauyszOBAKwZOoRGPsg3dAfJ2nG3klh9Iowtl0OnXvrL8HY6fSspZeSfouZWH5YWkZafslAEtHbgVPTMl56LMNEvkvVbSuDDsSL7E0gAMun9CfBPcBJAUeyBuzFVM98POA4ssucupOBu4H+QYciIWbd0Uzq+3raxmt/t+wWoG/axvTCUMMeTVdk86rM7Cmid2R4zVqqak4BLgRTH0AEceAP5LccpOThwcTyp4jljQDmBh2KhJhxJqR1vKoZ99AWH4YhqBeU38d1vklVzdRsTh6Q7U8g21tyaSWOcx2WS4CiDJ/NAgvAuYrq6csyfK7ccO+Gf8OYGny28JeeyD7HxIrjMzL0siljsNwAnJiR8Xe0HmtuIlr7Pz2lfVHPSSBfWvbDftB2BZgLsVSkefQ4mHk4zu97XPPDMPjz+hKKnZ9g+QlqfyJfeYGJ5ZldRbV06rFgfw6cQNpnZuxKjHMrrbE7GT2rW3aj6y49L4F8afEleeRFvwlMwjAOKPU4Uhx4BphPW/xhRs/akLYYpWNztlRA7Bosl2EoDjocCZgx05lQ1j1tPZb8YAC4E3D4D6w9FIh6G8iuBPM4mDlUzXgF0zN79/fcBLI9O81h2YbhWPcYjBkJdiDwNXYu3ho2YFkLfIY1b2JYhC16nZE3NwYRds6bvbGUwsQkrLkYGBl0OBIIF+OMZkKfN7v9zO9+v4S2gqPBjMbaIRhzANAPQ28sBbTfXG4GuxnMKuA9jHkHJ/Ycw2d92u3xBiA3Eohkv79sOAzHnAOMA4YHHY50F/s7JlZcG3QU0jElEMk+8zbsQ9ycAhxDezIZimomPU0zmGlM6HMTxvTI6Z+eQAlEeoa5dfuCOxjrlGNtCQ69sZRgvL95nE8scnm/v/00msLepKtM6Qfvte21oq6tz4balrL6uJu3295t+cQikyueurjItO6Z7Dn+2TT0sRcbD3on+aiySgPWWUmreZwL+2wKOhjZPSUQkU60LTt+tOPY1NpLGOf06LBn/h6mc4hkSna/SCiSQRHHHZXyMcTfCNs5RDJFCUSkE9aYVC/un5thL3wRtnOIZIoSiEgnjCXVi3vK/Zq64xwimaIEItIBu3x4vk1xubDBpnRx745ziGSSEohIB2Ju32pS3G/GmsjisJ1DJJOUQEQ6oAK6SNeUQEQ6oAK6SNeUQEQ6oAK6SNeUQER2ogK6SHKUQER2ogK6SHKUQER2ogK6SHKUQER2ogK6SHKUQER2ogK6SHKUQES2owK6SPKUQES2owK6SPKUQES2owK6SPKUQES2owK6SPKUQES2owK6SPKUQES2UQFdJDVKICLbqIAukholEJFtVEAXSY0SiMg2KqCLpEYJRGQbFdBFUqMEIoIK6CJeKIGIoAK6iBdKICKogC7ihRKICCqgi3ihBCKCCugiXiiBSM5TAV3EGyUQyXkqoIt4owQiOU8FdBFvlEAk56mALuKNEojkPBXQRbxRApGcpgK6iHdKIJLTVEAX8U4JRHKaCugi3imBSE5TAV3EOyUQyWkqoIt4pwQiOUsFdBF/lEAkZ6mALuKPEojkLBXQRfxRApGcpQK6iD9KIJKzVEAX8UcJRHKSCugi/imBSE5SAV3EPyUQyUkqoIv4pwQiOUkFdBH/lEAkJ6mALuKfCToAyS3WnhWJv7P+SIMdYqytDCwOY24A8lM45Hlj7T/Cdg5PjGmyhs8iJvq8OWhhXcbPJz2WEoh0C/vuUSVxN3qlsUwGAkscsoM42IUukV/kD39mUdDBSPZRApGMi6047kjj8iCwV9CxSIcsxtRE1vEjM/bZeNDBSPZQApGMir09dpwx7iNAYdCxSJcej9SaM5VEJFkqokvG2BVHH2iMex9KHtni1ESl+4egg5DsoQQiGZNwnVuB0qDjkFSYqbEVxx0ZdBSSHZRAJCPaL0JmXNBxSMqMcbk+6CAkOyiBSGYk7PigQxDPTrYrTiwPOggJPyUQyQjHmLFBxyCeRRKue3TQQUj4KYFIRljYN+gYxDuD1e9PuqQEIpnSJ+gAxA9XU1jSJSUQyRS9Y5TFXBz9/qRLSiAiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIpny/w2iQefLEHKDAAAAAElFTkSuQmCC'

router.post('/adminregister', async (req, res) => {
    let { adminusername,adminuseremail, adminuserpassword } = req.body;
	// console.log(adminusername,adminuserpassword)
	const dateToken = new Date().getTime().toString();
	const hashToken = await bcrypt.hash(dateToken,tokensaltRounds);
    // 对密码进行加密处理
    try {
        const hashedPassword = await bcrypt.hash(adminuserpassword, saltRounds);
		
        let sql = `insert into adminuser (adminusername,adminuseremail,adminuserpassword,admintoken,adminavater) values ('${adminusername}','${adminuseremail}','${hashedPassword}','${hashToken}','${defaultAvater}')`;
		// console.log(sql)
        db.query(sql).then(result => {
            res.send({
                code: 200,
                message: '注册成功'
            });
        }).catch(err => {
            res.send({
                code: 500,
                message: '注册失败'
            });
        });
    } catch (error) {
        res.send({
            code: 500,
            message: '密码加密失败'
        });
    }
});

router.post('/adminlogin', async (req, res) => {
    let { adminusername, adminuserpassword } = req.body;
    let sql = `SELECT * FROM adminuser WHERE adminusername = '${adminusername}'`;
    db.query(sql).then(async (result) => {
        if (result.length > 0) {
            const user = result[0];
            const match = await bcrypt.compare( adminuserpassword, user.adminuserpassword);
			// console.log(match)
            if (match) {
                res.send({
                    code: 200,
                    message: '登录成功',
                    token: user.admintoken
                });
            } else {
                res.send({
                    code: 400,
                    message: '密码错误'
                });
            }
        } else {
            res.send({
                code: 404,
                message: '用户不存在'
            });
        }
    }).catch(err => {
        res.send({
            code: 500,
            message: '登录失败'
        });
    });
});

module.exports = router;